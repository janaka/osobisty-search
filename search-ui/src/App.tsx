
import React, { useRef, useState, useEffect } from 'react';
import { SearchClient as TypesenseSearchClient } from "typesense";
import useFetch from './useFetchHook';
import {
  BrowserRouter as Router,
  useLocation,
} from "react-router-dom";


import './App.css';

// 6be0576ff61c053d5f9a3225e2a90f76

const tsSearchClient = new TypesenseSearchClient({
  nodes: [
    {
      host: 'localhost',
      port: '8108',
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});

function App() {
  const [searchRes, setSearchRes] = useState({ results: [{ hits: [] }] });
  const [selectedHit, setSelectedHit] = useState(null);
  return (
    <Router>
      <div onKeyPress={(e) =>
        console.log(e.key)
      }>
        <Search typesenseClient={tsSearchClient} placeholderText={undefined} autoFocus={true} results={setSearchRes}>
          <Results data={searchRes} selectedHit={selectedHit} setSelectedHit={setSelectedHit} />
          <DocPreview hitData={selectedHit} setSelectedHit={setSelectedHit} />
        </Search>
      </div>
    </Router>
  );
}


// A custom hook that builds on useLocation to parse
// the query string params
function useQuery():URLSearchParams {
  return new URLSearchParams(useLocation().search);
}


// Search component
function Search(props: any) {
  const [resultCount, setResultCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  let query = useQuery();
  const q = query.get("q")
  let q1

  if (resultCount==0 && q) {
    q1 = q
    console.log("==="+q1)
    doSearch(props.typesenseClient, q1);
  }

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
      'query_by': 'content, tags, title, authors'
    }
    return searchParams;
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
        <input
          value = {q1}
          placeholder={props.placeholderText}
          autoFocus={props.autoFocus}
          className="search-box-input"
          onChange={async (e) => {
            let r: any = null;
            try {
              if (e.target.value && e.target.value.length > 0) {
                await doSearch(props.typesenseClient, e.target.value);
                //   if ('error' in r.results[0]) {
                //     console.error("Typesense backend returned an error", r.results[0])
                //     return
                //   }
                //   props.results(r);
                //   setResultCount(r.results[0].found)
                //   setSearchTime(r.results[0].search_time_ms)
                //   //r.foreach((e:any) => console.log(e));
                //   r.results.forEach((result: any) => (
                //     result.hits.forEach((hit: any) => (
                //       console.log(hit)
                //     ))
                //   ));
              } else {
                // reset when input box is cleared
                props.results(null)
                setResultCount(0)
                setSearchTime(0)
              }
            } catch (e) {
              console.error(e)
            }
          }}
        />
        <button title="Clear search" className="search-box-clear">
          ×
        </button>
      </div>
      <div className="sidebar-stats">
        <div className="sidebar-results-stats">
          {resultCount} results ({searchTime}ms)
        </div>
      </div>
      <div>
        {}
        {props.children}
      </div>
    </div>
  );
}

function Results(props: any) {
  // const [selectedRowUI, setSelectedRowUI] = useState("");
  return (
    <div className="search-results">
      {props.data &&
        <ol className="search-results-list">
          {
            props.data.results.map((result: any) => (
              result.hits.map((hit: any) => (
                <li
                  className={ (props.selectedHit && props.selectedHit.document.id==hit.document.id) ? "search-result selected" : "search-result" }
                  key={hit.document.id}
                  onClick={() => (
                    props.setSelectedHit(hit)
                  )
                  }
                >
                  {hit.document.type
                    ? <span className="search-result-module">{hit.document.type}</span>
                    : <span className="search-result-module">none</span>
                  }
                  {hit.document.title && <span className="search-result-title">{hit.document.title}</span>}
                  {hit.highlights.length > 0
                    && <span className="search-result-content" dangerouslySetInnerHTML={{ __html: hit.highlights[0].snippet }}></span>
                  }
                  <span className="search-result-content">{hit.document.content}</span>
                </li>
              ))
            ))
          }
        </ol>}
    </div >
  )
}


function DocPreview(props: any) {
  function addHightlightMarkup(tsHitDataObj: any, fieldname: string): string {
    let fieldvalue: string = tsHitDataObj.document[fieldname];
    tsHitDataObj.highlights.map((highlight: any) => {
      if (highlight.field == fieldname) {
        highlight.matched_tokens.map((match_token: string) => (
          fieldvalue = tsHitDataObj.document[fieldname].replaceAll(match_token, "<mark>" + match_token + "</mark>")
        ))
      }
    })
    return fieldvalue
  }

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
              href={props.hitData.document.link}
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
            <div className="data-row"><span className="field-heading">Type:</span><span className="field-value">{props.hitData.document.type} </span></div>
            {props.hitData.document.authors && <div className="data-row"><span className="field-heading">Authors:</span><span className="field-value">{props.hitData.document.authors}</span></div>}
            <div className="data-row"><span className="field-heading">Date:</span><span className="field-value">{props.hitData.document.date} </span></div>
            <div className="data-row"><span className="field-heading">Tags:</span><span className="field-value">{props.hitData.document.tags}</span></div>
          </div>
          <div className="doc-preview-content" dangerouslySetInnerHTML={{ __html: addHtmlFormatting(addHightlightMarkup(props.hitData, "content")) }}>
          </div>
          {/* {props.hitData.document.type=="Twitter-bm" && <EmbedTweet tweetUrl={props.hitData.document.link} /> } */}
        </div>
      }
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
