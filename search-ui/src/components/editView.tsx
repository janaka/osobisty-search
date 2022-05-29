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
import markdown from 'remark-parse';
import slate from 'remark-slate';
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


  const docId = id;
  const docEditContent = editContent;

  // "Purchase date: \
  // Purchased from: Craig Hardy \
  // Sold date: 27 Sept 2021 \
  // \
  // ![ownership transfer confirmation](../attachments/2021-09-27-14-04-23.png) \
  // Insurance cancelled 27 sept 2021 14:38. £109.55 will be refunded ![insurance cancellation](../attachments/2021-09-27-14-38-23.png) \
  // \
  // ## Anela @ Drax about CTO opportunity" //editContent;

  // TODO: handle loading and saving the zettle document from file via the API
  // use the indexdb provider for offline strage in the browser together with 
  // websocket provider to sync to backend for persistence. 

  console.log("START");
  // Create a yjs document and get the shared type
  console.log("docId=" + docId);

  const editableProps: TEditableProps<TElement[]> = {
    autoFocus: false,
    spellCheck: false,
    placeholder: "Type…",
    className: "doc-preview-content",
  };

  //use remark-slate to de/serialise MD https://github.com/hanford/remark-slate


  let initialValue: any = [{ type: 'p', children: [{ text: 'initial value' }] }, { type: 'p', children: [{ text: 'dfgdfg' }] }];

  let docFromTypesense: any = [];

  useMemo(
    async () => {

      try {
        await unified()
          .use(markdown)
          .use(slate, { nodeTypes: plateNodeTypes }) // map remark-slate to Plate node `type`
          // .process(fetch('test.md'), (err, file) => {
          //   if (err) throw err;
          //   console.log({ file });
          // });
          .process(docEditContent, (_, nodes) => {
            docFromTypesense = nodes.result //TODO: replace with load from backend via wsprovider
          });
      } catch (error) {
        throw error;
      }


      console.log("remark-slate `result`:", docFromTypesense)
      //console.log("remark-slate `value`:", value)

    }, [docId]
  );


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
    return new WebsocketProvider('ws://localhost:1234', docName, yDoc) // sync to backend for persistence 

  }, [docName])

  wsProvider.on('status', (event: any) => {
    console.log(`wsProvider server connect status(docName:${docName}):`, event.status) // logs "connected" or "disconnected"

  })

  // `synced` fires before `sync`
  wsProvider.on('synced', (isSynced: boolean) => {
    console.log("synced: ", isSynced);
    console.log(sharedRoot);
    console.log("sharedRoot len: ", sharedRoot && sharedRoot.length)
    if (sharedRoot !== null && sharedRoot.length == 0) {
      //TODO: this logic moves to the server 
      console.log("New doc, load initial value")
      //setValue(docFromTypesense);

      sharedRoot.applyDelta(slateNodesToInsertDelta(docFromTypesense));
      //sharedRoot.applyDelta(slateNodesToInsertDelta(value));
    } else {
      console.log("doc existing on server. Wait for sync.")
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
  }, [wsProvider.doc])


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
        console.log("Plate onChange()")
        setValue(newValue)
        // console.log("`sharedRoot` onChange():", editor.sharedRoot.toDelta())
        // console.log("`newValue` onChange():", newValue)
      }}

    />
  );
};

export default EditView;