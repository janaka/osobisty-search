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



export function DocFullpage({ isAuthenticated, wsAuthToken }: { isAuthenticated: boolean, wsAuthToken: string }) {
  //const { isAuthenticated  } = useAuth0();
  

  // useEffect(() => {

  // }, [getAccessTokenSilently])















  return (


    <div className="container mx-auto h-screen pb-6" >
      <div className="h-auto rounded-lg bg-primarybg p-4 mt-4  scroll-auto overscroll-auto">
        <EditView isAuthenticated={isAuthenticated} wsAuthToken={wsAuthToken} editMode={TEditMode.EditMd} />
      </div>
    </div>


  );


}
