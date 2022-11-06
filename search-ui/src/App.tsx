
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { SearchClient as TypesenseSearchClient } from "typesense";
import useFetch from './hooks/useFetchHook';
import useKeyboardShortcut from './hooks/useKeyboardShortcutHook';
import {
  BrowserRouter as Router, Routes, Route, createBrowserRouter, createRoutesFromElements, RouterProvider,
} from "react-router-dom";
import './App.css';
import { func } from 'prop-types';
import LoginButton from './components/loginButton';
import LogoutButton from './components/logoutButon';
import { threadId } from 'worker_threads';
import EditView from './components/editView';
import { PlateProvider } from '@udecode/plate';
import { addHightlightMarkup } from './utils/addHighlightMarkup';
import { DocPreview } from './components/docPreview';
import { Search } from './components/search';
import { SearchResults } from './components/searchResults';
import { DocFullpage } from './components/docFullpage';
import { TEditMode } from './types/TEditMode';
import { Testeditor1 } from './testeditor';

// 6be0576ff61c053d5f9a3225e2a90f76

const audience: string = process.env.REACT_APP_AUTH0_AUDIENCE ? process.env.REACT_APP_AUTH0_AUDIENCE : "";
const TYPESENSE_HOST: string = process.env.REACT_APP_TYPESENSE_HOST ? process.env.REACT_APP_TYPESENSE_HOST : "";
const TYPESENSE_PORT: string = process.env.REACT_APP_TYPESENSE_PORT ? process.env.REACT_APP_TYPESENSE_PORT : "";
const TYPESENSE_PROTOCOL: string = process.env.REACT_APP_TYPESENSE_PROTOCOL ? process.env.REACT_APP_TYPESENSE_PROTOCOL : "https";

if (TYPESENSE_PROTOCOL !== "http" && TYPESENSE_PROTOCOL !== "https") throw "TYPESENSE_PROTOCOL is configured with an invalid value. Must be `http` or `https`"
if (TYPESENSE_HOST === "" || TYPESENSE_PORT === "") throw new Error("REACT_APP_TYPESENSE_HOST and/or REACT_APP_TYPESENSE_PORT env var came through empty")


function App() {
  const { user, error, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [searchRes, setSearchRes] = useState({ results: [{ hits: [] }] });
  const [selectedHit, setSelectedHit] = useState<{} | null>();
  const [doReset, setDoReset] = useState(false);
  const [docCount, setDocCount] = useState("");
  const [darkMode, SetDarkMode] = useState(true);
  const [token, setToken] = useState("");
  useEffect(() => {
    
      //console.log(`Grabbing access token - audience:${audience}`)

      getAccessTokenSilently({
        audience: audience,
        scope: "read:zettleDocuments"
      }).then((tkn: string)=> {
        setToken(tkn)
        
      })
      
      //console.log("app token: ", token)
  },[getAccessTokenSilently])


  const typesenseHost = `${TYPESENSE_HOST}:${TYPESENSE_PORT}/typesense`

  const tsSearchClient = new TypesenseSearchClient({
    nodes: [
      {
        host: typesenseHost, // this is a hack. The requests go out as http://localhost:3002/typesense:80/ 
        port: 80, // this stays as 80 even on TLS, part of the API proxy hack
        protocol: TYPESENSE_PROTOCOL,
      },
    ],
    additionalHeaders: {
      Authorization: `Bearer ${token}`,
    },
    sendApiKeyAsQueryParam: false,
    apiKey: 'klsjdf98wrlkASDHc&E9sdaflsdfhj934rASFasdf',
    connectionTimeoutSeconds: 2,
  });


  useEffect(() => {
    const getDocCount = async () => {
      //let response = tsSearchClient.collections("zettleDocuments").retrieve();
      const collection = tsSearchClient.collections("zettleDocuments");
      //let response = collection.documents.length;
      console.log(collection.documents.length);
      setDocCount(collection.documents.length.toString());
    }

    void getDocCount();

    if (darkMode) {
      document.body.classList.add("dark")
    }

  }, []);


  const escapekeyHandler = (): void => {

    if (selectedHit) {
      console.log("escape pressed - preview open")
      setSelectedHit(null)
    } else {
      console.log("escape pressed - no preview open")
      setDoReset(true);
    }
  }
  useKeyboardShortcut(["Escape"], escapekeyHandler, { overrideSystem: false })

  useEffect(() => {
    return () => {
      setDoReset(false)
    }
    //console.log("Behavior before the component is added to the DOM");\\\\\\
  });

  const toggleDarkmodeKbShortcutHandler = (): void => {

    if (darkMode) {
      SetDarkMode(false)
      document.body.classList.remove("dark")
    } else {
      SetDarkMode(true);
      document.body.classList.add("dark")
    }
  }
  useKeyboardShortcut(["Meta", "`"], toggleDarkmodeKbShortcutHandler, { overrideSystem: true }) // cmd + `



  if (isLoading) {
    return <div>Loading ...</div>;
  }

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Search typesenseClient={tsSearchClient} doReset={doReset} placeholderText={"Type to search " + docCount + " docs"} autoFocus={true} results={setSearchRes}>
          <SearchResults searchResultsData={searchRes} selectedHitData={selectedHit} setSelectedHitFunc={setSelectedHit} />
          <DocPreview isAuthenticated={isAuthenticated} hitData={selectedHit} setSelectedHitFunc={setSelectedHit} wsAuthToken={token} editMode={TEditMode.EditMd}/>
        </Search>,
      },
      {
        path: "documents/:collectionName/:id",
        element: <DocFullpage isAuthenticated={isAuthenticated} wsAuthToken={token}/>,
      },
      {
        path: "test",
        element: <Testeditor1 />,
      },
    ]);


  
    if (!isAuthenticated) {
      return (<div>
        <h4> Login to start using Osobisty Search</h4>
        <LoginButton />
      </div>)
    } else {
      return (
        <RouterProvider router={router} />
      );
    }  
}



export default App;

