import React, { useRef, useState } from 'react';
//import { SearchClient as TypeSearchClient } from "typesense";
import { SearchClient as TypesenseSearchClient } from "typesense";
// import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
// import {
//   InstantSearch,
//   SearchBox,
//   Pagination,
//   Highlight,
//   connectHits,
// } from 'react-instantsearch-dom';
import './App.css';

// 6be0576ff61c053d5f9a3225e2a90f76

// const searchClient = algoliasearch('osobisty-search-ui', 'xyz');

// const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
//   server: {
//     apiKey: 'xyz', // Be sure to use the search-only-api-key
//     nodes: [
//       {
//         host: 'localhost',
//         port: '8108',
//         protocol: 'http',
//       },
//     ],
//   },
//   // The following parameters are directly passed to Typesense's search API endpoint.
//   //  So you can pass any parameters supported by the search endpoint below.
//   //  queryBy is required.
//   additionalSearchParameters: {
//     queryBy: 'title',
//   },
// });
// const searchClient = typesenseInstantsearchAdapter.searchClient;

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
  const [selectedDocID, setSelectedDocID] = useState(0);
  return (
    <div>
      <Search typesenseClient={tsSearchClient} placeholderText={undefined} autoFocus={true} results={setSearchRes}>
        <Results data={searchRes} selectedDocID={setSelectedDocID} />
        <DocPreview docID={selectedDocID} selectedDocID={setSelectedDocID} />
      </Search>
    </div>
  );
}

// Search component
function Search(props: any) {
  const [docID, setDocID] = useState(0);
  //const [query, setQuery] = useState("");

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

    console.log(queryInput)
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
          data-form-type=""
          onChange={async (e) => {
            const r: any = await doSearch(props.typesenseClient, e.target.value);
            props.results(r);
            //r.foreach((e:any) => console.log(e));
            r.results.forEach((result: any) => (
              result.hits.forEach((hit: any) => (
                console.log(hit)
              ))
            ));
          }}
        />
        <button title="Clear search" className="search-box-clear">
          ×
        </button>
      </div>
      <div>
        {/* {JSON.stringify(searchRes)} */}
        {props.children}
      </div>
    </div>
  );
}

function Results(props: any) {

  return (
    <ol className="search-results-list">
      {
        props.data.results[0].hits.map((hit: any) => (
          <li
            className="search-result"
            key={hit.document.id}
            onClick={() => (props.selectedDocID(hit.document.id))}
          >
            <span className="search-results-title">{hit.document.title}</span>
            <span className="search-result-content">{hit.document.content}</span>
          </li>
        ))
      }
    </ol>
  )
}


function DocPreview(props: any) {
  return (
    <div>
      Preview
      {props.docID > 0 &&
        <div className="doc-preview">
          <div className="doc-preview-buttons">
            <button
              title="Close preview"
              className="button doc-preview-close"
              onClick={() => (props.selectedDocID(0))}
            >
              ×
            </button>
            <a
              title="Open on new page"
              href="https://thesephist.com/posts/unbundling-cloud/"
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
              className="button doc-preview-open"
            >
              <span className="desktop">open </span>→
            </a>
            <div className="doc-preview-title">
              <p>Open DocID: {props.docID}</p>
            </div>
          </div>
          <div className="doc-preview-content"></div>
        </div>
      }
    </div>
  )
}



export default App;
