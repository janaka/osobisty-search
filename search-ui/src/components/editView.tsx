// @refresh reset
import React, { useState, useMemo, useEffect } from 'react'
// Import the core binding
import { withYjs, yTextToSlateElement, slateNodesToInsertDelta, YjsEditor } from '@slate-yjs/core';
import * as Y from 'yjs';
//import {YXmlText} from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import {
  Plate,
  PlateEditor,
  withPlate,
  createTEditor,
  withTReact,
  TElement,
  TEditableProps,
  AutoformatBlockRule,
  unwrapList,
} from '@udecode/plate'
import { PLUGINS } from './slate-plate/plugins';
import { remark } from 'remark'
import remarkParse from 'remark-parse';
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkSlate from 'remark-slate';
import remarkFrontmatter from 'remark-frontmatter'
import unified from 'unified';
import { withTYjs } from './slate-plate/withTYjs';
import { plateNodeTypes } from './slate-plate/remarkslate-nodetypes';
import * as awarenessProtocol from 'y-protocols/awareness'
import * as random from 'lib0/random'
import * as math from 'lib0/math'
import { deltaInsertToSlateNode } from '@slate-yjs/core/dist/utils/convert';
import { YXmlText } from 'yjs/dist/src/internals';



export enum TEditMode {
  ReadOnly = "readonly",
  EditMd = "editmd",
  EditRaw = "editraw",
}

export type MyEditor = PlateEditor<TElement[]> & { typescript: boolean };

const EditView = ({ id, editContent, editMode }: { id: string, editContent: string, editMode: TEditMode }) => {
  // TODO: handle loading and saving the zettle document from file via the API
  // use the indexdb provider for offline strage in the browser together with 
  // websocket provider to sync to backend for persistence. 

  const docId = id;
  let docEditContent = editContent;

  console.log("START");
  // Create a yjs document and get the shared type
  console.log("docId=" + docId);

  const editableProps: TEditableProps<TElement[]> = {
    autoFocus: false,
    spellCheck: false,
    placeholder: "Type…",
    className: "doc-preview-content",
  };

  let initialValue: any = [{ type: 'p', children: [{ text: 'initial value' }] }, { type: 'p', children: [{ text: 'dfgdfg' }] }];

  let docFromTypesense: any = [];

  const [value, setValue] = useState<TElement[]>([]);

  // const webrtcOpts = {
  //   // Specify signaling servers. The client will connect to every signaling server concurrently to find other peers as fast as possible.
  //   signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
  //   // If password is a string, it will be used to encrypt all communication over the signaling servers.
  //   // No sensitive information (WebRTC connection info, shared data) will be shared over the signaling servers.
  //   // The main objective is to prevent man-in-the-middle attacks and to allow you to securely use public / untrusted signaling instances.
  //   password: 'lksjdf8743$£%£$%£%£4safasdf892834ASFDSDFjlkasdflsdf"3?',
  //   // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
  //   awareness: new awarenessProtocol.Awareness(yDoc),
  //   // Maximal number of WebRTC connections.
  //   // A random factor is recommended, because it reduces the chance that n clients form a cluster.
  //   maxConns: 20 + math.floor(random.rand() * 15),
  //   // Whether to disable WebRTC connections to other tabs in the same browser.
  //   // Tabs within the same browser share document updates using BroadcastChannels.
  //   // WebRTC connections within the same browser are therefore only necessary if you want to share video information too.
  //   filterBcConns: true,
  //   // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts for available options.
  //   // y-webrtc uses simple-peer internally as a library to create WebRTC connections.
  //   peerOpts: {}
  // }
  // const webRtcProvider = new WebrtcProvider(yjsRoomName, yDoc, webrtcOpts); // sync between brwoser directly client side.
  // webRtcProvider.on('synced', (synced: any) => {
  //   // synced or peers
  //   console.log("webRtcProvider server connect status:", synced)
  // })

  const docName = "osobisty" + docId

  const wsProvider = useMemo(() => {
    console.log("room name: ", docName)
    const yDoc = new Y.Doc();

    // const ws = new WebSocket('wss://127.0.0.1:3002/documents/osobisty1034')
    // ws.addEventListener('error', function (event) {
    //   console.log('WebSocket error: ', event);
    // });

    return new WebsocketProvider('wss://127.0.0.1:3002/documents', docName, yDoc) // sync to backend for persistence 

  }, [docName])

  wsProvider.on('status', (event: any) => {
    console.log(`wsProvider server connect status(docName:${docName}):`, event.status) // logs "connected" or "disconnected"
    console.log(event)
  })

  // `synced` fires before `sync`
  wsProvider.on('synced', async (isSynced: boolean) => {
    console.log("synced: ", isSynced);
    console.log(sharedRoot);
    console.log("sharedRoot len: ", sharedRoot && sharedRoot.length)
    if (sharedRoot !== null && sharedRoot.length == 0) {
      //TODO: this logic moves to the server 
      console.log("New doc, load initial value")
      //setValue(docFromTypesense);
      try {
        let res = await fetch('test.md', { mode: 'no-cors' })
        let data = await res.text()
        //console.log("test.md data: ", data)
        docEditContent = data // uncomment this line to use test.md. Move this to a unit test.

        //use remark-slate to de/serialise MD https://github.com/hanford/remark-slate
        // remark plugins https://github.com/remarkjs/remark/blob/main/doc/plugins.md

        const vfile = await remark()
          .use(remarkParse)
          .use(remarkFrontmatter, ['yaml'])
          .use(remarkUnwrapImages)
          .use(remarkSlate, { nodeTypes: plateNodeTypes, imageCaptionKey: 'cap', imageSourceKey: 'src' }) // map remark-slate to Plate node `type`. Fixes crash.
          .process(docEditContent)

        docFromTypesense = vfile.result

        console.log("remark-slate `result`:", docFromTypesense)
        const delta = slateNodesToInsertDelta(docFromTypesense)
        console.log("delta: ", delta)
        sharedRoot.applyDelta(delta);
      } catch (error) {
        console.error(error)
      }



      //sharedRoot.applyDelta(slateNodesToInsertDelta(value));
    } else {
      console.log("doc exists on server. Wait for sync.")
      //sharedRoot.doc?.load();
      //console.log("sharedRoot !==`null` or `length !== 0`")
    }

  })

  let sharedRoot: YXmlText | null = null;

  const editor = useMemo(() => {

    sharedRoot = wsProvider.doc.get(docId, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);
    //console.log("just created: ", sharedRoot)
    //console.log("after provider: ", sharedRoot.toDelta())

    //sharedRoot.doc?.load();

    //console.log("reset `editor` for docId=" + docId)
    //console.log("`sharedRoot` init value:", sharedRoot)

    // the order below is important
    return withTReact(
      withTYjs(
        withPlate(
          createTEditor(),
          { id: docId, plugins: PLUGINS.allNodes, disableCorePlugins: false }
        ),
        sharedRoot,
        { autoConnect: false }
      )
    );
  }, [docId])


  //https://signaling.simplewebrtc.com:443/



  // Connect editor and providers in useEffect to comply with concurrent mode requirements.
  useEffect(() => {
    wsProvider.connect();
    console.log("connect wsProvider")


    return () => wsProvider.disconnect();
  }, [wsProvider]);

  useEffect(() => {
    //Connect the editor to the shared type by overwriting the current editor value with the in the shared root contained document and registering the appropriate event listeners.
    YjsEditor.connect(editor);
    console.log("connect editor")

    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (

    <Plate
      id={docId}
      editor={editor}
      editableProps={{ ...editableProps }}
      //initialValue={value}
      value={value} //{[{ children: [{ text: '' }] }]}
      //plugins={plugins} // when the `editor` instance is provided this doesn't apply
      onChange={(newValue) => {
        console.log("Plate onChange() fired")
        setValue(newValue)
        // console.log("`sharedRoot` onChange():", editor.sharedRoot.toDelta())
        // console.log("`newValue` onChange():", newValue)
      }}

    />
  );
};



export default EditView;