import * as Y from 'yjs';
import { XmlText } from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { slateNodesToInsertDelta } from '@slate-yjs/core'


import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as mutex from 'lib0/mutex';
import * as map from 'lib0/map';

import ws from 'ws';

import debounce from 'lodash.debounce';

import { callbackHandler, isCallbackSet } from './yjs-ws-server-callback.js';

import fs from 'fs';
import os from 'os'
import dotenv from 'dotenv';
import { LeveldbPersistence } from 'y-leveldb';

import { unified, ProcessCallback } from 'unified';
import { VFile } from 'vfile'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkSlate from 'remark-slate';
import { remarkToSlate } from 'remark-slate-transformer'
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkFrontmatter from 'remark-frontmatter';
import { plateNodeTypes, plateNodeTypesHeadingObjectKey, remarkToSlateOverrides } from './remarkslate-nodetypes.js';
import { File } from '@babel/types';
import { Node } from 'slate';
import { InsertDelta } from '@slate-yjs/core/dist/model/types.js';
import e from 'cors';



dotenv.config();

const CALLBACK_DEBOUNCE_WAIT = Number(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000
const CALLBACK_DEBOUNCE_MAXWAIT = Number(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0';
const YSTATE_LEVELDB_PATH = String(process.env.YSTATE_LEVELDB_PATH);
//const ySTATE_LEVELDB_PATH = process.env.YPERSISTENCE

let sendcount: number = 0;

//TODO: this file a mess. Needs refactoring at somepoint.


interface IPersistence<T> {
  bindState: (docName: string, yDoc: WSSharedDoc) => void;
  writeState: (docName: string, yDoc: WSSharedDoc) => Promise<any>;
  provider: T
}


// Document change state history is stored in a persistent cache so we can recover from server restarts.
// We are using a local levelDB instnace for now. 
// when scaling out the backend this will have to be shared storate of some sort.
let levelDbPersistence: IPersistence<LeveldbPersistence> | null = null;
let fixedFilePersistence: IPersistence<any>;

fixedFilePersistence = {
  provider: null,
  bindState: testMdBindState,
  writeState: async (docName, ydoc) => { }

}

export const setLevelDbPersistence = (persistence_: IPersistence<LeveldbPersistence>) => {
  levelDbPersistence = persistence_
}

export const getLevelDbPersistence = (): IPersistence<LeveldbPersistence> | null => levelDbPersistence


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
  doc.wsConns.forEach((_: any, ws: ws) => {
    send(doc, ws, message)
  })
}

export class WSSharedDoc extends Y.Doc {

  name: string;
  wsConns: Map<any, any>;
  mux: mutex.mutex;
  awareness: awarenessProtocol.Awareness;
  /**
   * @param {string} name: unique name for the document
   */
  constructor(name: string) {
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
 * @param {boolean} gc - whether to allow garbage collection on the doc (applies only when created)
 * @return {WSSharedDoc}
 */
export const getYDoc = (docname: string, gc: boolean = true): WSSharedDoc => map.setIfUndefined(docs, docname, () => {
  const sharedDoc = new WSSharedDoc(docname)
  sharedDoc.gc = gc
  console.log("getYDoc(" + docname + ")")


  if (levelDbPersistence !== null) {
    //TODO: levelDB bindState needs to be called always
    // Need to add logic to handle loding file from persistance if it doesn't exit
    // clear from the leveldb cache on connection close. 
    levelDbPersistence.bindState(docname, sharedDoc)
  }

  docs.set(docname, sharedDoc) // add to docs collection

  console.log("doc added: ", docname)
  console.log("total docs: ", docs.size)
  return sharedDoc
})

/**
 * Bind (read and write) to test.md which is a document used to test + debug editor functionality
 * @param docName 
 * @param ydoc 
 */
function testMdBindState(docName: string, ydoc: Y.Doc) {
  //const persistedYdoc = await ldb.getYDoc(docName)

}

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
    console.log("closing connection for doc: ", doc.name)
    const controlledIds: Set<number> = doc.wsConns.get(conn)
    doc.wsConns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    if (doc.wsConns.size === 0 && levelDbPersistence !== null) {
      // if persisted, we store state and destroy ydocument
      //TODO: change this to MD serialised persistence to file
      levelDbPersistence.writeState(doc.name, doc).then(() => {
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
    sendcount++;
    console.log("send() called. Total calls=", sendcount);
    // console.log(m)
    // const decoder = decoding.createDecoder(m)
    // decoding.readVarUint(decoder)
    conn.send(m, (err: any) => { err != null && closeConn(doc, conn) })
  } catch (e) {
    console.error(e)
    closeConn(doc, conn)
  }
}

const pingTimeout = 30000


/**
 * 
 * @param path path where data is persisted
 */
const initLevelDbConneciton = (path: string): IPersistence<LeveldbPersistence> => {

  if (typeof path === 'string' && levelDbPersistence == null) {
    console.log('Persisting document state to "' + path + '"')
    let mdfileDelta 
    const ldb = new LeveldbPersistence(path)

    const ldbBindState = async (docName: string, ydoc: WSSharedDoc) => { // Sync doc state between client and server. Especially to handle server restarts
      const persistedYdoc = await ldb.getYDoc(docName) // get persisted state
      console.log("leveldb state length ", persistedYdoc.store.clients.size)
      if (persistedYdoc.store.clients.size==0) {
        mdfileDelta = loadFileAsSlateDelta(docName)
        const doc = persistedYdoc.get(docName, Y.XmlText) as Y.XmlText
        doc.applyDelta(mdfileDelta)
      }
      const newUpdates = Y.encodeStateAsUpdate(ydoc) // new state coming from client
      ldb.storeUpdate(docName, newUpdates) // persist updated state
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc)) // apply persisted state to client
      ydoc.on('update', update => {
        console.log("update")
        ldb.storeUpdate(docName, update)
      })
    }

    levelDbPersistence = {
      provider: ldb as LeveldbPersistence,
      bindState: ldbBindState,
      writeState: async (docName, ydoc) => {
        const newUpdates = Y.encodeStateAsUpdate(ydoc)
        ldb.storeUpdate(docName, newUpdates)
      }
    }

  }

  if (levelDbPersistence == null) throw ("levelDbPersistence object cannot be null. Initialising LevelDB conneciton faild")

  return levelDbPersistence;
}


/**
 * @param {ws} ws websocket conneciton
 * @param {any} req
 * @param {any} opts 
 */
export const setupWSConnection = (ws: ws, req: any, docName: string = req.url.slice(1).split('?')[0], gc: boolean = true) => {
  ws.binaryType = 'arraybuffer'

  setLevelDbPersistence(initLevelDbConneciton(YSTATE_LEVELDB_PATH))

  // get doc, initialize if it does not exist yet
  const doc = getYDoc(docName, gc)
  doc.wsConns.set(ws, new Set())



  // listen and reply to events
  ws.on('message', (message: ArrayBuffer) => messageListener(ws, doc, new Uint8Array(message)))

  // TODO: check if we can use the hapi-websocket built in ping/pong
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


function loadFileAsSlateDelta(docName: string): InsertDelta | null {

  console.log("ydoc.get(`" + docName + "`, Y.XmlText)")
  //let sharedroot: XmlText = ydoc.get(docName, Y.XmlText) as Y.XmlText



  //  console.log("load test file ", sharedroot.length)


  const rawPersistedTestMd = loadTestMdFileFromDisk(docName + ".md")
  let delta: InsertDelta | null = null;


  if (rawPersistedTestMd !== undefined) {
    try {

      //.use(slate, { nodeTypes: plateNodeTypes, imageCaptionKey: 'cap', imageSourceKey: 'src' }) // map remark-slate to Plate node `type`. Fixes crash.
      //remark()
      unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkUnwrapImages)
        .use(remarkToSlate, {
          // If you use TypeScript, install `@types/mdast` for autocomplete.
          overrides: remarkToSlateOverrides
        })
        .process(rawPersistedTestMd, (error, vfile) => {

          if (error) throw (error)

          let initialValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];

          if (!vfile) throw ("vfile empty")

          if (!vfile.result) throw ("remark-slate ain't doing it's thing")

          console.log("remark-slate `result`:", vfile.result)
          const slateTestMd: Node[] = vfile.result as Node[];

          delta = slateNodesToInsertDelta(slateTestMd)

          // sharedroot.applyDelta(delta);
        });


    } catch (error) {
      console.error(error)
    }


  } else {
    throw ("test.md load failed");
  }

  // ydoc.on('update', update => {
  //   // write updates back to test.md for persistence.
  //   //ldb.storeUpdate(docName, update)
  //   console.log("ydoc.onupdate fired!")
  // })
return delta
}




function loadTestMdFileFromDisk(filename: string): string | undefined {
  try {
    const dataRootPath = os.homedir + "/code-projects/osobisty-search/api/data/test"
    const s: string = fs.readFileSync(dataRootPath + "/" + filename, "utf-8")
    //let c: T | undefined = this.deserialize(s);
    return s;
  } catch (error) {
    const e = error as NodeJS.ErrnoException
    if (e.code === "ENOENT") {
      console.log("test.md file doesn't exist so returning `undefined`. Likely legit. " + error)
      return undefined
    } else {
      throw new Error("Failed. " + error)
    }
  }
}

