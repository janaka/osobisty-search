
import React, { useRef, useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { SearchClient as TypesenseSearchClient } from "typesense";
import useFetch from './useFetchHook';
import useKeyboardShortcut from './useKeyboardShortcutHook';
import {
  BrowserRouter as Router,
  useLocation,
  useHistory
} from "react-router-dom";


import './App.css';
import { func } from 'prop-types';
import LoginButton from './components/loginButton';
import LogoutButton from './components/logoutButon';
import { threadId } from 'worker_threads';

// 6be0576ff61c053d5f9a3225e2a90f76

const audience: string = process.env.REACT_APP_AUTH0_AUDIENCE ? process.env.REACT_APP_AUTH0_AUDIENCE : "";
const TYPESENSE_HOST: string = process.env.REACT_APP_TYPESENSE_HOST ? process.env.REACT_APP_TYPESENSE_HOST : "";
const TYPESENSE_PORT: string = process.env.REACT_APP_TYPESENSE_PORT ? process.env.REACT_APP_TYPESENSE_PORT : "";
const TYPESENSE_PROTOCOL: string = process.env.REACT_APP_TYPESENSE_PROTOCOL ? process.env.REACT_APP_TYPESENSE_PROTOCOL : "https";

if (TYPESENSE_PROTOCOL !== "http" && TYPESENSE_PROTOCOL !== "https") throw "TYPESENSE_PROTOCOL is configured with an invalid value. Must be `http` or `https`"
if (TYPESENSE_HOST === "" || TYPESENSE_PORT === "") throw new Error("REACT_APP_TYPESENSE_HOST and/or REACT_APP_TYPESENSE_PORT env var came through empty")

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [searchRes, setSearchRes] = useState({ results: [{ hits: [] }] });
  const [selectedHit, setSelectedHit] = useState(null);
  const [doReset, setDoReset] = useState(false);
  const [docCount, setDocCount] = useState("");
  const [darkMode, SetDarkMode] = useState(true);
  const [token, setToken] = useState("");

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    (async () => {
      //console.log(`Grabbing access token - audience:${audience}`)

      const tkn = await getAccessTokenSilently({
        audience: audience,
        scope: "read:zettleDocuments"
      });
      //const tkn = await getAccessTokenSilently();
      setToken(tkn)

    })();
  }, [getAccessTokenSilently])


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
      let collection = tsSearchClient.collections("zettleDocuments");
      //let response = collection.documents.length;
      console.log(collection.documents.length);
      setDocCount(collection.documents.length.toString());
    }

    void getDocCount();

    if (darkMode) {
      document.body.classList.add("dark")
    } else {

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

  const backtickKeyHandler = (): void => {

    if (darkMode) {
      SetDarkMode(false)
      document.body.classList.remove("dark")
    } else {
      SetDarkMode(true);
      document.body.classList.add("dark")
    }
  }
  useKeyboardShortcut(["`"], backtickKeyHandler, { overrideSystem: false })

  if (!isAuthenticated) {
    return (<div>
      <h4> Login to start using Osobisty Search</h4>
      <LoginButton />
    </div>)
  }


  if (!token) {
    return <div>Loading ...</div>;
  }

  return (
    <Router>
      <Search typesenseClient={tsSearchClient} doReset={doReset} placeholderText={"Type to search " + docCount + " docs"} autoFocus={true} results={setSearchRes}>
        <Results data={searchRes} selectedHit={selectedHit} setSelectedHit={setSelectedHit} />
        <DocPreview hitData={selectedHit} setSelectedHit={setSelectedHit} />
      </Search>
    </Router>
  );
}


// A custom hook that builds on useLocation to parse
// the query string params
function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}


// Search component
function Search(props: any) {
  const [resultCount, setResultCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [searchInputBoxValue, setSearchInputBoxValue] = useState("")
  const searchInputBox = useRef<HTMLInputElement>(null);

  const backslashkeyHandler = (): void => {
    console.log("backslash pressed")
  }

  //useKeyboardShortcut(["Escape"], escapekeyHandler, { overrideSystem: false })
  useKeyboardShortcut(["/"], backslashkeyHandler, { overrideSystem: false })


  let query = useQuery();
  // const q = query.get("q")

  let q = query.get("q")

  useEffect(() => {
    searchInputBox.current && searchInputBox.current.focus();
  });


  useEffect(() => {
    if (props.doReset) {
      console.log("doReset")
      clearSearch()
    }
    return () => {
      // clean up here
    }
    //console.log("Behavior before the component is added to the DOM");
  });

  useEffect(() => {
    if (q) {
      console.log("===" + q)
      setSearchInputBoxValue(q)
      doSearch(props.typesenseClient, q);
    }
  }, []);


  function searchReq() {
    const search = {
      searches: [
        {
          'collection': 'zettleDocuments',
        }
      ]
    }
    return search;
  }

  function commonSearchParams(query: any) {
    console.log(query)
    let searchParams = {
      'q': query,
      'query_by': 'title, tags, note_content, source_content, authors, type',
      'facet_by': 'type, tags',
      'prioritize_exact_match': true,
      'per_page': '20'
    }
    return searchParams;
  }

  function clearSearch() {
    console.log("clearSearch()")
    //history.push("")
    props.results(null)
    setResultCount(0)
    setSearchTime(0)
    setSearchInputBoxValue("")
  }

  async function doSearch(typesenseClient: any, queryInput: string | null | undefined) {

    console.log("doSearch():")
    console.log("query input text: " + queryInput)
    if (queryInput == null || undefined) return
    let response = await typesenseClient.multiSearch.perform(searchReq(), commonSearchParams(queryInput));
    console.log(response);
    if ('error' in response.results[0]) {
      console.error("Typesense backend returned an error", response.results[0])
      return
    }
    props.results(response);
    setResultCount(response.results[0].found)
    setSearchTime(response.results[0].search_time_ms)
    //r.foreach((e:any) => console.log(e));
    // response.results.forEach((result: any) => (
    //   result.hits.forEach((hit: any) => (
    //     console.log(hit)
    //   ))
    // ));

    return response;
  }

  return (
    <div>
      <div className="search-box">
        <input ref={searchInputBox}
          value={searchInputBoxValue}
          placeholder={props.placeholderText}
          autoFocus={props.autoFocus}
          className="search-box-input"
          onChange={async (e) => {
            let r: any = null;
            try {
              if (e.target.value && e.target.value.length > 0) {
                setSearchInputBoxValue(e.target.value)
                await doSearch(props.typesenseClient, searchInputBoxValue);
              } else {
                // reset when input box is cleared
                console.log("input onChange() clear")
                clearSearch()
              }
            } catch (e) {
              console.error(e)
            }
          }}
          onKeyDown={
            (e) => {
              e.key == "Escape" ? clearSearch() : null
            }
          }
        />
        <button title="Clear search" className="search-box-clear"
          onClick={async (e) => {
            clearSearch()
          }}
        >
          ×
        </button>
        <LogoutButton />
      </div>
      <div className="sidebar-stats">
        <div className="sidebar-results-stats">
          {resultCount} results ({searchTime}ms)
        </div>
      </div>
      <div>

        {props.children}
      </div>
    </div>
  );
}

function Results(props: any) {
  // const [selectedRowUI, setSelectedRowUI] = useState("");

  // const moveFocus = (key: any): void => {

  //   const active = document.activeElement;
  //   if (active!==null) {
  //     if (key === 40 && active.nextSibling) {
  //       active.nextSibling;
  //     }
  //     if (key === 38 && active.previousSibling) {
  //       active.previousSibling.focus();
  //     }
  //   }

  // }

  //useKeyboardShortcut([String.fromCharCode(40), String.fromCharCode(38)], moveFocus, { overrideSystem: false })

  return (
    <div className="search-results">
      {props.data && props.data.results.length > 0 && props.data.results[0].hits.length > 0
        ?
        <ol className="search-results-list">
          {
            props.data.results.map((result: any) => (
              result.hits.map((hit: any) => (
                <li
                  className={(props.selectedHit && props.selectedHit.document.id == hit.document.id) ? "search-result selected" : "search-result"}
                  key={hit.document.id}
                  onClick={() => (
                    props.setSelectedHit(hit)
                  )
                  }
                >
                  {hit.document.type
                    ? <span className="search-result-module" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "type") }}></span>
                    : <span className="search-result-module">none</span>
                  }
                  {hit.document.title && <span className="search-result-title" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "title") }}></span>}
                  <span className="search-result-content" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "note_content") }}></span>
                </li>
              ))
            ))
          }
        </ol>
        :
        <div><Suggestions /></div>

      }
    </div >
  )
}


function addHightlightMarkup(tsHitDataObj: any, fieldname: string): string {
  let fieldvalue: string = tsHitDataObj.document[fieldname];
  // deepcode ignore PureMethodReturnValueIgnored: <please specify a reason of ignoring this>
  tsHitDataObj.highlights.map((highlight: any) => {
    if (highlight.field == fieldname) {
      highlight.matched_tokens.map((match_token: string) => (
        fieldvalue = tsHitDataObj.document[fieldname].replaceAll(match_token, "<mark>" + match_token + "</mark>")
      ))
    }
  })
  return fieldvalue
}

function DocPreview(props: any) {
  function addHtmlFormatting(content: string): string {
    let _content = content;

    _content = "<p>" + _content + "</p>"
    //console.log(_content)
    _content = _content.replace(/[\n]{2}/g, "</p><p>")
    //console.log(_content)

    return _content
  }

  return (
    <div>
      {props.hitData &&
        <div className="doc-preview">
          <div className="doc-preview-buttons">
            <button
              title="Close preview"
              className="button doc-preview-close"
              onClick={() => (props.setSelectedHit(null))}
            >
              ×
            </button>
            {props.hitData.document.link && <a
              title="Open on new page"
              href={props.hitData.document.type.startsWith("zettle-") ? "vscode://file/Users/janakaabeywardhana/code-projects/zettelkasten" + props.hitData.document.link : props.hitData.document.link}
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              className="button doc-preview-open"
            >
              <span className="desktop">open </span>→
            </a>}
            <div className="doc-preview-title" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(props.hitData, "title") }}>
            </div>
          </div>
          <div className="doc-preview-data">
            <div className="data-row"><span className="field-heading">Id:</span><span className="field-value">{props.hitData.document.id} </span></div>
            <div className="data-row"><span className="field-heading">Type:</span><span className="field-value">{props.hitData.document.type} </span></div>
            {props.hitData.document.authors && <div className="data-row"><span className="field-heading">Authors:</span><span className="field-value">{props.hitData.document.authors}</span></div>}
            <div className="data-row"><span className="field-heading">Date:</span><span className="field-value">{props.hitData.document.date} </span></div>
            <div className="data-row"><span className="field-heading">Tags:</span><span className="field-value" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(props.hitData, "tags") }}></span></div>
            {props.hitData.document.link && <div className="data-row"><span className="field-heading">Link:</span><span className="field-value">{props.hitData.document.type.toString().startsWith("zettle") ? "vscode://file/Users/janakaabeywardhana/code-projects/zettelkasten" + props.hitData.document.link : props.hitData.document.link}</span></div>}
          </div>
          {props.hitData.document.note_content && <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: addHtmlFormatting(addHightlightMarkup(props.hitData, "note_content")) }}></div>}
          {props.hitData.document.source_content && <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: addHtmlFormatting(addHightlightMarkup(props.hitData, "source_content")) }}></div>}
          {/* {props.hitData.document.type=="Twitter-bm" && <EmbedTweet tweetUrl={props.hitData.document.link} /> } */}
        </div>
      }
    </div>
  )
}

function Suggestions() {
  return (
    <div className="search-results search-results-empty">
      <h2 className="empty-state-heading">Suggestions</h2><div className="search-results-suggestions">
        <button className="search-results-suggestion">PaaS</button></div>
      <h2 className="empty-state-heading">Keybindings</h2><div className="keyboard-map">
        <ul className="keyboard-map-list"><li className="keyboard-map-item"><div className="keybinding-keys">
          <kbd className="">Tab</kbd></div><div className="keybinding-detail">Next search result</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Shift</kbd>
            <kbd className="">Tab</kbd></div><div className="keybinding-detail">Previous search result</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Enter</kbd></div>
            <div className="keybinding-detail">Show preview pane</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Escape</kbd></div><
            div className="keybinding-detail">Hide preview pane, clear search</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">/</kbd></div>
            <div className="keybinding-detail">Focus search box</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">`</kbd></div>
            <div className="keybinding-detail">Switch light/dark color theme</div></li></ul></div>

      <h2 className="empty-state-heading">About Osobisty</h2>
      <div className="about">
        <p className="">
          Osobisty means <em>private</em> in Polish.</p>
        <p>
          Osobisty is a universal, personal search engine by <a href="https://janaka.dev" target="_blank" className="">Janaka</a>.
          It's heavily influenced by <a href="https://thesephist.com/" target="_blank">Linus Lee's</a>
          <a href="https://github.com/thesephist/monocle" target="_blank">Monolce</a>, the UI design is a clone.
          It's built with React (UI), NodeJS (crawlers + indexers), Typescript, and <a href="https://typesense.org">Typesene</a> for the full-text index and search engine in the backend.
          Osobisty searches across Janaka's content; Zettlekasten, Blogs, Twitter boommarks, Chrome bookmarks, and Kindle hilights.
        </p>
        <p>Read more about why I built Osobisty here.</p>
      </div>
    </div>
  )
}


// twitter embed API https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/overview
// https://usehooks-typescript.com/react-hook/use-fetch


interface TwitterEmbed {
  url: string
  author_name: string
  author_url: string
  html: string
  width: number
  height: number
  type: string
  cache_age: number
  provider_name: string
  provider_url: string
  version: string
}


function EmbedTweet(props: any) {


  const url = "https://publish.twitter.com/oembed?url=" + encodeURIComponent(props.tweetUrl)


  const { data, error } = useFetch<TwitterEmbed[]>(url, {
    mode: 'no-cors', referrerPolicy: 'same-origin', keepalive: true, headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Access-Control-Allow-Origin': '*'
    }
  })

  if (error) return <p>There is an error. {console.error(error)}</p>
  if (!data) return <p>Loading...</p>
  return (
    <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: data[0].html }}>
    </div>
  )

}


export default App;
