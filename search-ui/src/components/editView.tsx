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
  LinkToolbarButton,
  ToolbarProps,
  HeadingToolbar,
} from '@udecode/plate'
import { PLUGINS } from './slate-plate/plugins';

import { withTYjs } from './slate-plate/withTYjs';

import { XmlText } from 'yjs';
import { MyValue, MyEditor, createMyEditor } from './slate-plate/plateTypes';
import { debounce } from 'lodash';
import { TEditMode } from '../types/TEditMode';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from '@styled-icons/material/Link';



//export type MyEditor = PlateEditor<TElement[]> & { typescript: boolean };

// self note: destructuring syntax with TS works (dev time). check what the advantages are of using RN prop-types (runtime).
// https://blog.logrocket.com/comparing-typescript-and-proptypes-in-react-applications/

const EditView = ({ id, collectionName, editMode, wsProvider, className }: { id: string, collectionName: string, editMode: TEditMode, wsProvider: WebsocketProvider, className?: string }) => {

  //TODO: refactor: pull the wsprovider code out and pass instance in as a prop. 
  // This will allow us to decouple the following ws auth code from the editor component
  // useEffect(() => {
  //   (async () => {
  //     console.log("getAccessTokenSilently() token: ")
  //     //console.log(`Grabbing access token - audience:${audience}`)



  //   });
  // }, [getAccessTokenSilently])

  let docId = id;

  //let docEditContent = editContent;

  console.log("START");
  // Create a yjs document and get the shared type
  console.log("docId=" + docId);

  const editableProps: TEditableProps<MyValue> = {
    autoFocus: false,
    spellCheck: false,
    placeholder: "Type…",
    className: className,
  };

  // let initialValue: any = [{ type: 'p', children: [{ text: 'New doc. client-side initial value' }] }, { type: 'p', children: [{ text: 'dfgdfg' }] }];

  // let docFromTypesense: any = [];

  //const [value, setValue] = useState<MyValue>([]);

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

  const docName = "osobisty" + docId;





  let sharedRoot: XmlText | null = null;

  const editor = useMemo(() => {

    console.log("wsProvider.doc.get(`" + docName + "`, Y.XmlText)")
    // define top level type as yXmlText
    sharedRoot = wsProvider.doc.get(docName, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);

    //console.log("just created: ", sharedRoot)
    //console.log("after provider: ", sharedRoot.toDelta())

    //sharedRoot.doc?.load();

    //console.log("reset `editor` for docId=" + docId)
    //console.log("`sharedRoot` init value:", sharedRoot)

    // the order below is important
    return withTReact(
      withTYjs(
        withPlate<MyValue, MyEditor>(
          createMyEditor(),
          { id: docName, plugins: PLUGINS.allNodes}
        ),
        sharedRoot,
        { autoConnect: false }
      )
    );
  }, [docName])


  // Connect editor and providers in useEffect to comply with concurrent mode requirements.

  useEffect(() => {
    // `synced` fires before `sync`
    wsProvider.on('synced', async (isSynced: boolean) => {
      console.log("==== onSynced() ======");
      console.log("synced status: ", isSynced);
      console.log("sharedRoot len: ", sharedRoot && sharedRoot.length)

      if (sharedRoot !== null && sharedRoot.length == 0) {
        console.log("Server didn't return data. `sharedRoot` not `null` and `sharedRoot.length` is zero. Obj `sharedRoot`:: ", sharedRoot)
      } else if (wsProvider.wsconnected == true && sharedRoot == null) {
        console.log("`sharedRood` object is `null`. Obj `sharedRoot`: ", sharedRoot)
        throw new Error("sharedRoot is `null`. Something has gone wrong.")
      } else if (wsProvider.wsconnected == false) {
        console.log("Explicit disconnect. Obj `sharedRoot`: ", sharedRoot)
      } else {
        console.log("We have some content! Obj `sharedRoot`: ", sharedRoot)
      }

      console.log("`sharedRoot` content: ", sharedRoot?.toString())

      console.log("==========");
    })

    wsProvider.connect();
    console.log("connect wsProvider")
    return () => wsProvider.disconnect();
  }, [wsProvider]);

  useEffect(() => {
    //Connect the editor to the shared type by overwriting the current editor value with the in the shared root contained document and registering the appropriate event listeners.
    YjsEditor.connect(editor);
    console.log("connect editor. connected=", YjsEditor.connected(editor))

    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <div>
      {/* <Toolbar><LinkToolbarButton icon={<Link />} /></Toolbar> */}
      <Plate<MyValue, MyEditor>
      id={docId}
      editor={editor}
      editableProps={{ ...editableProps }}
      
      //value={value} // do not set directly with useState ref: https://plate.udecode.io/docs/Plate#value
      //plugins={plugins} // when the `editor` instance is provided this doesn't apply
      onChange={async (newValue) => {

        //debounce(async () =>{console.log("Plate onChange() fired")}, 10)
        //console.log("Plate onChange() fired")
        //setValue(newValue) // see note for value prop above
        // console.log("`sharedRoot` onChange():", editor.sharedRoot.toDelta())
        // console.log("`newVsdfalue` onChange():", newValue)



      }}

    />
    
    </div>
    
  );
};

const Toolbar = (props: ToolbarProps) => <HeadingToolbar {...props} />; 

export default EditView;
