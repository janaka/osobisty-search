import React, { Children, PropsWithChildren } from 'react';
import ReactDOM, { render } from 'react-dom';
import { createRoot } from 'react-dom/client';
//import { useHistory } from 'react-router-dom';
import './index.css';
import App from './App';
import { AppState, Auth0Provider, Auth0ProviderOptions } from "@auth0/auth0-react";
import { BrowserRouter, useNavigate } from 'react-router-dom';
import * as Sentry from "@sentry/react";

const sentryDsn: string = process.env.REACT_APP_SENTRY_DSN ? process.env.REACT_APP_SENTRY_DSN : "";


Sentry.init({
  dsn: sentryDsn,
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});



const auth0ClientId: string = process.env.REACT_APP_AUTH0_CLIENT_ID ? process.env.REACT_APP_AUTH0_CLIENT_ID : "";
const auth0Domain: string = process.env.REACT_APP_AUTH0_DOMAIN ? process.env.REACT_APP_AUTH0_DOMAIN : "";
const audience: string = process.env.REACT_APP_AUTH0_AUDIENCE ? process.env.REACT_APP_AUTH0_AUDIENCE : "";



const container = document.getElementById("root");

// const history = useHistory();

// const onRedirectCallback = (appState: any) => {
//   history.push(appState?.returnTo || window.location.pathname);
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