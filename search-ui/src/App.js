import React, { useState } from 'react';
import { SearchClient as TypeSearchClient } from "typesense";
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

const tsClient = new TypeSearchClient({
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
  
  return (
    <div>
      <Search typesenseClient={tsClient} />
    </div>
  );
}

// Search component
function Search(props) {
  const [docID, setDocID] = useState(0);
  const [searchRes, setSearchRes] = useState(null);
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

  function commonSearchParams(query) {
    console.log(query)
    let searchParams = {
      'q': { query },
      'query_by': 'title',
    }
    return searchParams;
  }

  function doSearch(typesenseClient, queryInput) {

    console.log(queryInput)
    let response = typesenseClient.multiSearch.perform(searchReq(), commonSearchParams(queryInput));
    // this is a promise so not available when being resolved int he results section below
    console.log("asdfs"+response)
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
          onKeyPress={(e) => {
            setSearchRes(doSearch(props.typesenseClient, e.key))
          }}
        />
        <button title="Clear search" className="search-box-clear">
          ×
        </button>
      </div>
      <div>

        {searchRes && <ol className="search-results-list">
          {searchRes.hits.map(hit => (
            <li
              className="search-result"
              key={hit.id}
              onClick={() => setDocID(hit.id)}
            >
              <span className="search-results-title">{hit.title}</span>
              <span className="search-result-content">{hit.content}</span>
            </li>
          ))}
        </ol>
        }

      </div>
    </div>
  );
}




export default App;
