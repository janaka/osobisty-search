import React from 'react';
import ReactDOM, { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
//import { useHistory } from 'react-router-dom';
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

const auth0ClientId: string = process.env.REACT_APP_AUTH0_CLIENT_ID ? process.env.REACT_APP_AUTH0_CLIENT_ID : "";
const auth0Domain: string = process.env.REACT_APP_AUTH0_DOMAIN ? process.env.REACT_APP_AUTH0_DOMAIN : "";
const audience: string = process.env.REACT_APP_AUTH0_AUDIENCE ? process.env.REACT_APP_AUTH0_AUDIENCE : "";

console.log("audience: " + audience)

const container = document.getElementById("root");

// const history = useHistory();

// const onRedirectCallback = (appState: any) => {
//   history.push(appState?.returnTo || window.location.pathname);
// };

//*** React17
  
  //render(
  // <Auth0Provider
  //   domain={auth0Domain}
  //   clientId={auth0ClientId}
  //   redirectUri={window.location.origin}
  //   audience={audience}
  //   scope="read:zettleDocuments" // scopes are used for consent. if not consented the api access token generation for this scope will fail. 
  // //onRedirectCallback={onRedirectCallback}
  // >
  //   <App />
  // </Auth0Provider>,
  // container);


//*** React18

const root = createRoot(container!); // react 18
root.render(
  <Auth0Provider
    domain={auth0Domain}
    clientId={auth0ClientId}
    redirectUri={window.location.origin}
    audience={audience}
    scope="read:zettleDocuments" // scopes are used for consent. if not consented the api access token generation for this scope will fail. 
  //onRedirectCallback={onRedirectCallback}
  >
    <App />
  </Auth0Provider>,
  // container
);