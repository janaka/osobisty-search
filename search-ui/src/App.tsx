import { readFileSync } from 'fs';
import React, { useRef, useState } from 'react';
import { SearchClient as TypesenseSearchClient } from "typesense";
//import he from "he";
var he = require('he');
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
    <div onKeyPress={(e) =>
      e.key
    }>
      <Search typesenseClient={tsSearchClient} placeholderText={undefined} autoFocus={true} results={setSearchRes}>
        <Results data={searchRes} selectedHit={setSelectedHit} />
        <DocPreview hitData={selectedHit} selectedHit={setSelectedHit} />
      </Search>
    </div>
  );
}

// Search component
function Search(props: any) {
  // const [docID, setDocID] = useState(0);
  //const [query, setQuery] = useState("");
  const [resultCount, setResultCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  function searchReq() {
    const search = {
      searches: [
        {
          'collection': 'zettleDocuments',
        },
      ]
    }
    return search;
  }

  function commonSearchParams(query: any) {
    console.log(query)
    let searchParams = {
      'q': query,
      'query_by': 'title',
    }
    return searchParams;
  }

  async function doSearch(typesenseClient: any, queryInput: string) {

    console.log("doSearch():")
    console.log("query input text: " + queryInput)
    let response = await typesenseClient.multiSearch.perform(searchReq(), commonSearchParams(queryInput));
    console.log(response);
    // console.log(JSON.stringify(response));
    // response["results"].map((result:any) => (
    //   result.hits.map((hit:any) => (
    //     console.log(hit)
    //   ))
    // ))

    return response;
  }

  return (
    <div>
      <div className="search-box">
        <input
          placeholder={props.placeholderText}
          autoFocus={props.autoFocus}
          className="search-box-input"
          onChange={async (e) => {
            let r: any = null;
            try {
              if (e.target.value && e.target.value.length > 0) {
                r = await doSearch(props.typesenseClient, e.target.value);
                if ('error' in r.results[0]) {
                  console.error("Typesense backend returned an error", r.results[0])
                  return
                }
                props.results(r);
                setResultCount(r.results[0].found)
                setSearchTime(r.results[0].search_time_ms)
                //r.foreach((e:any) => console.log(e));
                r.results.forEach((result: any) => (
                  result.hits.forEach((hit: any) => (
                    console.log(hit)
                  ))
                ));
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
        {/* {JSON.stringify(searchRes)} */}
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
          {props.data.results[0].hits.map((hit: any) => (
            <li
              className={"search-result "}
              key={hit.document.id}
              onClick={() => (
                props.selectedHit(hit)
              )
              }
            >
              { hit.document.type
                ? <span className="search-result-module">{hit.document.type}</span>
                : <span className="search-result-module">none</span>
              }
              {hit.highlights.length > 0 
                ? <span className="search-result-title" dangerouslySetInnerHTML={{__html:hit.highlights[0].snippet}}></span>
                : <span className="search-result-title">{hit.document.title}</span>
              }
              <span className="search-result-content">{hit.document.content}</span>
            </li>
          ))}

        </ol>}
    </div >
  )
}


function DocPreview(props: any) {
  return (
    <div>
      {props.hitData &&
        <div className="doc-preview">
          <div className="doc-preview-buttons">
            <button
              title="Close preview"
              className="button doc-preview-close"
              onClick={() => (props.selectedHit(null))}
            >
              ×
            </button>
            {props.hitData.document.link && <a
              title="Open on new page"
              href="https://thesephist.com/posts/unbundling-cloud/"
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              className="button doc-preview-open"
            >
              <span className="desktop">open </span>→
            </a>}
            <div className="doc-preview-title">
              {props.hitData.document.title}
            </div>
          </div>
          <div className="doc-preview-content">
            {props.hitData.document.content}
          </div>
        </div>
      }
    </div>
  )
}



export default App;
