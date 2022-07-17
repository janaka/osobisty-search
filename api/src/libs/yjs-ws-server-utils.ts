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
import { LeveldbPersistence } from 'y-leveldb';

import { unified, ProcessCallback } from 'unified';
import { VFile } from 'vfile'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkSlate from 'remark-slate';
import {remarkToSlate} from 'remark-slate-transformer'
import remarkUnwrapImages from 'remark-unwrap-images';
import remarkFrontmatter from 'remark-frontmatter';
import { plateNodeTypes, plateNodeTypesHeadingObjectKey, remarkToSlateOverrides } from './remarkslate-nodetypes.js';
import { File } from '@babel/types';
import { Node } from 'slate';





const CALLBACK_DEBOUNCE_WAIT = Number(process.env.CALLBACK_DEBOUNCE_WAIT) || 2000
const CALLBACK_DEBOUNCE_MAXWAIT = Number(process.env.CALLBACK_DEBOUNCE_MAXWAIT) || 10000

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const wsReadyStateClosing = 2 // eslint-disable-line
const wsReadyStateClosed = 3 // eslint-disable-line

// disable gc when using snapshots!
const gcEnabled = process.env.GC !== 'false' && process.env.GC !== '0'
const persistenceDir = process.env.YPERSISTENCE

let sendcount: number = 0;

//TODO: this file a mess. Needs refactoring at somepoint.


interface IPersistence {
  bindState: (docName: string, yDoc: WSSharedDoc) => void;
  writeState: (docName: string, yDoc: WSSharedDoc) => Promise<any>;
  provider: any
}

let levelDbPersistence: IPersistence | null = null;
let fixedFilePersistence: IPersistence | null = null;
//TODO: 
// We want to support two different persistance instances. 1) levelDB for the _inbox_ and _todo_ docs. 2) md files for the rest.
// change the property `persistence` to two properties, one for each.


if (typeof persistenceDir === 'string') {
  console.info('Persisting documents to "' + persistenceDir + '"')

  const ldb = new LeveldbPersistence(persistenceDir)

  levelDbPersistence = {
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
    writeState: async (docName, ydoc) => { }
  }
}

export const setLevelDbPersistence = (persistence_: IPersistence) => {
  levelDbPersistence = persistence_
}

export const getLevelDbPersistence = (): IPersistence | null => levelDbPersistence


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
  switch (docname) {
    case "osobistyinbox":

      break;
    case "osobistytodo":

      break;

    case "osobistysimpletestmd":
      console.log("bind osobistysimpletestmd")
      testMdBindState(docname, sharedDoc)


      break;
      case "osobistycomplextestmd":
        console.log("bind osobistycomplextestmd")
        testMdBindState(docname, sharedDoc)
  
  
        break;
    default:
      if (levelDbPersistence !== null) {
        levelDbPersistence.bindState(docname, sharedDoc)
      }
      break;
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
const testMdBindState = (docName: string, ydoc: Y.Doc) => {
  //const persistedYdoc = await ldb.getYDoc(docName)

  const rawPersistedTestMd = loadTestMdFileFromDisk(docName + ".md")

  if (rawPersistedTestMd !== undefined) {
    try {
      //console.log(rawPersistedTestMd)


      //.use(remarkFrontmatter, ['yaml'])
      //.use(remarkUnwrapImages)
      //.use(slate, { nodeTypes: plateNodeTypes, imageCaptionKey: 'cap', imageSourceKey: 'src' }) // map remark-slate to Plate node `type`. Fixes crash.
      //remark()
      unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ['yaml'])
        .use(remarkUnwrapImages)
        .use(remarkToSlate,{
          // If you use TypeScript, install `@types/mdast` for autocomplete.
          overrides: remarkToSlateOverrides
        })
        .process(rawPersistedTestMd, (error, vfile) => {

          if (error) throw (error)

          console.log("ydoc.get(`" + docName + "`, Y.XmlText)")
          let sharedroot: XmlText = ydoc.get(docName, Y.XmlText) as Y.XmlText

          let initialValue: any = [{ type: 'p', children: [{ text: 'initial value from backend' }] }, { type: 'p', children: [{ text: 'hehehehe' }] }];

          if (!vfile) throw ("vfile empty")
          if (!vfile.result) throw("remark-slate ain't doing it's thing")

          console.log("remark-slate `result`:", vfile.result)
          const slateTestMd: Node[] = vfile.result as Node[];

          

          // if (slateTestMd == null || undefined) throw ("Coverting raw MD to slateMD failed! object returned was null or undefined!")

          const delta = slateNodesToInsertDelta(slateTestMd)

          sharedroot.applyDelta(delta);
        });

      //







      ydoc.on('update', update => {
        // write updates back to test.md for persistence.
        //ldb.storeUpdate(docName, update)
        console.log("ydoc.onupdate fired!")
      })
    } catch (error) {
      console.error(error)
    }

    //sharedRoot.applyDelta(delta);
    //const docRoot = ydoc.get(docName, Y.XmlText) as Y.XmlText

    //docRoot.applyDelta(delta)

    //const newUpdates = Y.encodeStateAsUpdate(ydoc)
    //ldb.storeUpdate(docName, newUpdates)


  } else {
    throw ("test.md load failed");
  }


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
    const controlledIds: Set<number> = doc.wsConns.get(conn)
    doc.wsConns.delete(conn)
    awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(controlledIds), null)
    if (doc.wsConns.size === 0 && levelDbPersistence !== null) {
      // if persisted, we store state and destroy ydocument
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
 * @param {ws} ws websocket conneciton
 * @param {any} req
 * @param {any} opts 
 */
export const setupWSConnection = (ws: ws, req: any, docName: string = req.url.slice(1).split('?')[0], gc: boolean = true) => {
  ws.binaryType = 'arraybuffer'
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

