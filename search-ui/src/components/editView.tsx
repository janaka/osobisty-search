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
import { useParams } from 'react-router-dom';
import LoginButton from './loginButton';



//export type MyEditor = PlateEditor<TElement[]> & { typescript: boolean };

// self note: destructuring syntax with TS works (dev time). check what the advantages are of using RN prop-types (runtime).
// https://blog.logrocket.com/comparing-typescript-and-proptypes-in-react-applications/



const EditView = ({ editMode, isAuthenticated, wsAuthToken, className }: { editMode: TEditMode, isAuthenticated: boolean, wsAuthToken: string, className?: string }) => {

  const [authError, setAuthError] = useState<string>();

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



  const params = useParams();
  console.log("url param id: ", params.id);

  if (!params.collectionName) throw new Error("`collectionName` cannot be `" + params.collectionName + "`");
  if (!params.id) throw new Error("`collectionName` cannot be `" + params.id + "`");

  const docId = params.id;
  const docName = "osobisty" + docId;
  const roomName = docName;
  console.log("<editView> LOAD");
  console.log("docId=" + docId);

  const wsProvider = useMemo(() => {
    let reconnecCount: number = 0;
    const collectionName = params.collectionName;


    const yWebsocketHost: string = process.env.REACT_APP_Y_WEBSOCKET_HOST ? process.env.REACT_APP_Y_WEBSOCKET_HOST : "";
    const yWebsocketPort: string = process.env.REACT_APP_Y_WEBSOCKET_PORT ? process.env.REACT_APP_Y_WEBSOCKET_PORT : "";

    console.log("useMemo ran");
    console.log("room name: ", roomName);
    const yDoc = new Y.Doc();

    if (isAuthenticated && !wsAuthToken) throw new Error("Access token is null! Cannot proceed. " + wsAuthToken);

    if (yWebsocketHost == "") throw new Error("`REACT_Y_WEBSOCKET_HOST` config value cannot be empty. Set this to the host name of the y-websocket backend.");

    let fqdnAddress: string = "wss://" + yWebsocketHost;
    if (yWebsocketPort !== "") { fqdnAddress = fqdnAddress + ":" + yWebsocketPort; }

    const _wsProvider = new WebsocketProvider(fqdnAddress + "/documents/" + collectionName, roomName, yDoc, { params: { token: wsAuthToken } }) // sync to backend for persistence 

    _wsProvider.on('status', (event: any) => {
      console.log(`wsProvider server connect status(roomName:${roomName}):`, event.status) // logs "connected" or "disconnected"
      console.log(event)
    })

    _wsProvider.on('connection-error', (WSErrorEvent: any) => {
      console.log(`wsProvider connection-error:`, WSErrorEvent) // logs "connected" or "disconnected"
    })

    _wsProvider.on('connection-close', (WSCloseEvent: any, provider: any) => {
      console.log(`wsProvider connection-close:`, WSCloseEvent) // logs "connected" or "disconnected"
      if (WSCloseEvent.code == "4001") {
        //_wsProvider.wsconnected = false;
        reconnecCount++;
        _wsProvider.wsUnsuccessfulReconnects = reconnecCount;

        console.log("Exponential back off, wsUnsuccessfulReconnects: ", _wsProvider.wsUnsuccessfulReconnects)
        setAuthError(WSCloseEvent.reason);
        // if (String(WSCloseEvent.reason).includes("jwt expired")) {
        //   window.location.reload();
        // }
      }
    })

    if (_wsProvider.ws !== null) {
      // wsProvider.ws.onmessage = (event) => { // switching this on causes the sync on the clinet side to be exteremly delayed. RCA theory - this was originally outside a hook like useEffect or useMemo. So each React render would have added a new handler. More handlers in the list the more too to get fired.
      //   console.log("ws message received: ", event)
      //   //wsProvider.ws?.onmessage
      // }
    }

    return _wsProvider;
    //return new WebsocketProvider('ws://127.0.0.1:12345', docName, yDoc) // sync to yjs-ws-server/server.ts


  }, [roomName])


  let sharedRoot: XmlText | null = null;

  const editor = useMemo(() => {

    console.log("wsProvider.doc.get(`" + docName + "`, Y.XmlText)")
    // define top level type as yXmlText
    sharedRoot = wsProvider.doc.get(docName, Y.XmlText) as Y.XmlText //getXmlText(yDoc, docId);

    // the order below is important
    return withTReact(
      withTYjs(
        withPlate<MyValue, MyEditor>( //withPlate is what applies the plugin overrides we define
          createMyEditor(),
          { id: docName, plugins: PLUGINS.allNodes }
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
    authError ?

      <div>
        <div>{authError}</div>
        <div>Try re-login <LoginButton /></div>
      </div>

      :
      <div>
        {/* <Toolbar><LinkToolbarButton icon={<Link />} /></Toolbar> */}
        <Plate<MyValue, MyEditor>
          //id={docId} // do NOT set this prop. breaks plugins like links floating menu
          editor={editor}
          editableProps={{ ...editableProps }}
          //value={value} // do not set directly with useState ref: https://plate.udecode.io/docs/Plate#value
          //plugins={plugins} // when the `editor` instance is provided this doesn't apply
          onChange={async (newValue) => {

          }}

        />

      </div>

  );
};

export default EditView;
