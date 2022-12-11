import React, { Children, PropsWithChildren } from 'react';
import ReactDOM, { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
//import { useHistory } from 'react-router-dom';
import './index.css';
import App from './App';
import { AppState, Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from 'react-router-dom';

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

// function Auth({ children, ...props }:{children:any}) {

//   const navigate = useNavigate();
//   const onRedirectCallback = (appState: any) => {
//     //navigate((appState && appState.returnTo) || window.location.pathname);
//   };
// return (
//   <Auth0Provider
//     domain={auth0Domain}
//     clientId={auth0ClientId}
//     redirectUri={window.location.origin}
//     audience={audience}
//     //useRefreshTokens= {true}
//     scope="read:zettleDocuments" // scopes are used for consent. if not consented the api access token generation for this scope will fail. 
//     onRedirectCallback={onRedirectCallback}

//     {...props}
//   >
//     {children}
//   </Auth0Provider>
// );
// };

const Auth0ProviderWithRedirectCallback = ({
  children,
  ...props
}: PropsWithChildren<Auth0ProviderOptions>) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    navigate((appState && appState.returnTo) || window.location.pathname);
  };

  return (
    <Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
      {children}
    </Auth0Provider>
  );
};



const root = createRoot(container!); // react 18
root.render(
  <BrowserRouter>
  <Auth0ProviderWithRedirectCallback
    domain={auth0Domain}
    clientId={auth0ClientId}
    redirectUri={window.location.origin}
    audience={audience}
    //useRefreshTokens= {true}
    scope="read:zettleDocuments" // scopes are used for consent. if not consented the api access token generation for this scope will fail. 
  >
    <App />
  </Auth0ProviderWithRedirectCallback>
  </BrowserRouter>
);