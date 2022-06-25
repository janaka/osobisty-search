import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import {LeveldbPersistence} from 'y-leveldb';

import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as mutex from 'lib0/mutex';
import * as map from 'lib0/map';

import ws from 'ws';

import debounce from 'lodash.debounce';

import { callbackHandler, isCallbackSet } from './yjs-ws-server-callback.js';


const CALLBACK_DEBOUNCE_WAIT = Number(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000
const CALLBACK_DEBOUNCE_MAXWAIT = Number(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'
const persistenceDir = process.env.YPERSISTENCE



interface IPersistence { bindState: (docName: string, yDoc: WSSharedDoc) => void; writeState: (docName: string, yDoc: WSSharedDoc) => Promise<any>; provider: any }

let persistence: IPersistence | null = null;

if (typeof persistenceDir === 'string') {
  console.info('Persisting documents to "' + persistenceDir + '"')
    
  const ldb = new LeveldbPersistence(persistenceDir)
  persistence = {
    provider: ldb,
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await ldb.getYDoc(docName)
      const newUpdates = Y.encodeStateAsUpdate(ydoc)
      ldb.storeUpdate(docName, newUpdates)
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
      ydoc.on('update', update => {
        ldb.storeUpdate(docName, update)
      })
    },
    writeState: async (docName, ydoc) => {}
  }
}

export const setPersistence = (persistence_: IPersistence) => {
  persistence = persistence_
}

export const getPersistence = (): IPersistence | null => persistence


// exporting docs so that others can use it
export const docs: Map<string, WSSharedDoc> = new Map()



const messageSync = 0
const messageAwareness = 1
// const messageAuth = 2

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
const updateHandler = (update: Uint8Array, origin: any, doc: WSSharedDoc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.wsConns.forEach((_: any, ws: ws) => send(doc, ws, message))
}

export class WSSharedDoc extends Y.Doc {

  name: string;
  wsConns: Map<any, any>;
  mux: mutex.mutex;
  awareness: awarenessProtocol.Awareness;
  /**
   * @param {string} name: unique name for the document
   */
  constructor (name: string) {
    super({ gc: gcEnabled })
    this.name = name
    this.mux = mutex.createMutex()
    /**
     * Maps from conn to set of controlled user ids. Delete all user ids from awareness when this conn is closed
     * @type {Map<Object, Set<number>>}
     */
    this.wsConns = new Map()
    /**
     * @type {awarenessProtocol.Awareness}
     */
    this.awareness = new awarenessProtocol.Awareness(this)
    this.awareness.setLocalState(null)
    /**
     * @param {{ added: Array<number>, updated: Array<number>, removed: Array<number> }} changes
     * @param {Object | null} conn Origin is the connection that made the change
     */
    const awarenessChangeHandler = ({ added, updated, removed }: { added: Array<number>; updated: Array<number>; removed: Array<number> }, conn: object | null) => {
      const changedClients = added.concat(updated, removed)
      if (conn !== null) {
        const connControlledIDs = /** @type {Set<number>} */ (this.wsConns.get(conn))
        if (connControlledIDs !== undefined) {
          added.forEach(clientID => { connControlledIDs.add(clientID) })
          removed.forEach(clientID => { connControlledIDs.delete(clientID) })
        }
      }
      // broadcast awareness update
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients))
      const buff = encoding.toUint8Array(encoder)
      this.wsConns.forEach((_: any, c: any) => {
        send(this, c, buff)
      })
    }
    this.awareness.on('update', awarenessChangeHandler)
    this.on('update', updateHandler)
    if (isCallbackSet) {
      this.on('update', debounce(
        callbackHandler,
        CALLBACK_DEBOUNCE_WAIT,
        { maxWait: CALLBACK_DEBOUNCE_MAXWAIT }
      ))
    }
  }
}

/**
 * Gets a Y.Doc by name, whether in memory or on disk
 *
 * @param {string} docname - the name of the Y.Doc to find or create. This is the unique key.
 * @param {boolean} gc - whether to allow gc on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export const getYDoc = (docname: string, gc: boolean = true): WSSharedDoc => map.setIfUndefined(docs, docname, () => {
  const doc = new WSSharedDoc(docname)
  doc.gc = gc
  if (persistence !== null) {
    persistence.bindState(docname, doc)
  }
  docs.set(docname, doc)
  console.log("doc added: ", docname)
  console.log("total docs: ", docs.entries.length)
  return doc
})



/**
 * @param {any} conn websocket conneciton
 * @param {WSSharedDoc} doc
 * @param {Uint8Array} message
 */
const messageListener = (conn: ws, doc: WSSharedDoc, message: Uint8Array) => {
  try {
    const encoder = encoding.createEncoder()
    const decoder = decoding.createDecoder(message)
    const messageType = decoding.readVarUint(decoder)
    switch (messageType) {
      case messageSync:
        encoding.writeVarUint(encoder, messageSync)
        syncProtocol.readSyncMessage(decoder, encoder, doc, null)
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder))
        }
        break
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
        break
      }
    }
  } catch (err) {
    console.error(err)
    doc.emit('error', [err])
  }
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn websocket conneciton
 */
const closeConn = (doc: WSSharedDoc, conn: ws) => {
  if (doc.wsConns.has(conn)) {
    const controlledIds: Set<number> = doc.wsConns.get(conn)
    doc.wsConns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    if (doc.wsConns.size === 0 && persistence !== null) {
      // if persisted, we store state and destroy ydocument
      persistence.writeState(doc.name, doc).then(() => {
        doc.destroy()
      })
      docs.delete(doc.name)
    }
  }
  conn.close()
}

/**
 * @param {WSSharedDoc} doc
 * @param {any} conn websocket conneciton
 * @param {Uint8Array} m
 */
const send = (doc: WSSharedDoc, conn: ws, m: Uint8Array) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, /** @param {any} err */ (err: any) => { err != null && closeConn(doc, conn) })
  } catch (e) {
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000

/**
 * @param {ws} ws websocket conneciton
 * @param {any} req
 * @param {any} opts 
 */
export const setupWSConnection = (ws: ws, req:any, { docName = req.url.slice(1).split('?')[0], gc = true }: any = {}) => {
  ws.binaryType = 'arraybuffer'
  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc)
  doc.wsConns.set(ws, new Set())
  // listen and reply to events
  ws.on('message', /** @param {ArrayBuffer} message */ (message: ArrayBuffer) => messageListener(ws, doc, new Uint8Array(message)))

  // Check if connection is still alive
  let pongReceived = true
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.wsConns.has(ws)) {
        closeConn(doc, ws)
      }
      clearInterval(pingInterval)
    } else if (doc.wsConns.has(ws)) {
      pongReceived = false
      try {
        ws.ping()
      } catch (e) {
        closeConn(doc, ws)
        clearInterval(pingInterval)
      }
    }
  }, pingTimeout)
  ws.on('close', () => {
    closeConn(doc, ws)
    clearInterval(pingInterval)
  })
  ws.on('pong', () => {
    pongReceived = true
  })
  // put the following in a variables in a block so the interval handlers don't keep in in
  // scope
  {
    // send sync step 1
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, ws, encoding.toUint8Array(encoder))
    const awarenessStates = doc.awareness.getStates()
    if (awarenessStates.size > 0) {
      const encoder = encoding.createEncoder()
      encoding.writeVarUint(encoder, messageAwareness)
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())))
      send(doc, ws, encoding.toUint8Array(encoder))
    }
  }
}