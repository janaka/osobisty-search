import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from "react-router-dom";
import { DocPreview } from './docPreview';
import { TEditMode } from '../types/TEditMode';
import EditView from './editView';
import { useAuth0 } from '@auth0/auth0-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { copyBlockMarksToSpanChild } from '@udecode/plate';
import LoginButton from './loginButton';

//const audience: string = process.env.REACT_APP_AUTH0_AUDIENCE ? process.env.REACT_APP_AUTH0_AUDIENCE : "";
const yWebsocketHost: string = process.env.REACT_APP_Y_WEBSOCKET_HOST ? process.env.REACT_APP_Y_WEBSOCKET_HOST : "";
const yWebsocketPort: string = process.env.REACT_APP_Y_WEBSOCKET_PORT ? process.env.REACT_APP_Y_WEBSOCKET_PORT : "";


export function DocFullpage({ token }: { token: string }) {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [authError, setAuthError] = useState<string>();

  // useEffect(() => {

  // }, [getAccessTokenSilently])



  const params = useParams();
  console.log("url param id: ", params.id);

  if (!params.collectionName) throw new Error("`collectionName` cannot be `" + params.collectionName + "`");
  if (!params.id) throw new Error("`collectionName` cannot be `" + params.id + "`");

  const docId = params.id;
  const roomName = "osobisty" + docId;

  const collectionName = params.collectionName;



  // TODO: consider if we should use one room name across docs rather than a room per doc as now. Hence a single wsProvider instance.
  const wsProvider = useMemo(() => {

    console.log("useMemo ran");
    console.log("room name: ", roomName);
    const yDoc = new Y.Doc();

    if (isAuthenticated && !token) throw new Error("Access token is null! Cannot proceed. " + token);

    if (yWebsocketHost=="") throw new Error("`REACT_Y_WEBSOCKET_HOST` config value cannot be empty. Set this to the host name of the y-websocket backend.");

    let fqdnAddress: string = "wss://" + yWebsocketHost;
    if (yWebsocketPort!=="") {fqdnAddress=fqdnAddress + ":" + yWebsocketPort;}

    const _wsProvider = new WebsocketProvider(fqdnAddress + "/documents/" + collectionName, roomName, yDoc, { params: { token: token } }) // sync to backend for persistence 

    _wsProvider.on('status', (event: any) => {
      console.log(`wsProvider server connect status(roomName:${roomName}):`, event.status) // logs "connected" or "disconnected"
      console.log(event)
    })

    _wsProvider.on('connection-error', (WSErrorEvent: any) => {
      console.log(`wsProvider connection-error:`, WSErrorEvent) // logs "connected" or "disconnected"
    })

    _wsProvider.on('connection-close', (WSCloseEvent: any, provider:any) => {
      console.log(`wsProvider connection-close:`, WSCloseEvent) // logs "connected" or "disconnected"
      if (WSCloseEvent.code=="4001") {
        setAuthError(WSCloseEvent.reason)
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






  return (
    authError ?
    
    <div>
      <div>{authError}</div>
      <div>Try re-login <LoginButton /></div>
    </div>
    
    :

    <div className="container mx-auto h-screen pb-6" >
      <div className="h-auto rounded-lg bg-primarybg p-4 mt-4  scroll-auto overscroll-auto">
        <EditView id={docId} collectionName={collectionName} wsProvider={wsProvider} editMode={TEditMode.EditMd} />
      </div>
    </div>


  );


}
