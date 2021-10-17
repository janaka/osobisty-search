import React, { useEffect, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import { DOMMessage, DOMMessageResponse } from './types';
import { SearchClient as TypesenseSearchClient } from "typesense";

function App() {
  const [title, setTitle] = React.useState('');
  const [headlines, setHeadlines] = React.useState<string[]>([]);

  useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    chrome.tabs && chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      /**
       * Sends a single message to the content script(s) in the specified tab,
       * with an optional callback to run when a response is sent back.
       *
       * The runtime.onMessage event is fired in each content script running
       * in the specified tab for the current extension.
       */
      chrome.tabs.sendMessage(
        tabs[0].id || 0,
        { type: 'GET_DOM' } as DOMMessage,
        (response: DOMMessageResponse) => {
          setTitle(response.title);
          setHeadlines(response.headlines);
        });
    });
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        Osobisty
      </header>
      <ul className="SEOForm">
        <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Title:</span>
            <span className={`SEOValidationFieldStatus ${title.length < 30 || title.length > 65 ? 'Error' : 'Ok'}`}>
              &nbsp;{title.length}&nbsp;Characters
            </span>
          </div>
          <div className="SEOVAlidationFieldValue">
            {title}
          </div>
        </li>

        <li className="SEOValidation">
          <div className="SEOValidationField">
            <span className="SEOValidationFieldTitle">Main Heading:</span>
            <span className={`SEOValidationFieldStatus ${headlines.length !== 1 ? 'Error' : 'Ok'}`}>
              &nbsp;{headlines.length}
            </span>
          </div>
          <div className="SEOVAlidationFieldValue">
            <ul>
              {headlines.map((headline, index) => (<li key={index}>{headline}</li>))}
            </ul>
          </div>
        </li>
      </ul>
      <div><textarea></textarea></div>
      <div>

        <OsobistyResults searchContext={title} />
      </div>
    </div>
  );
}

function OsobistyResults(props: any) {
  const [searchResults, setSearchResults] = useState({ results: [{ hits: [] }] });
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



  async function doSearch(queryInput: string | null | undefined) {


    const search = {
      searches: [
        {
          'collection': 'zettleDocuments',
        }
      ]
    }

    let searchParams = {
      'q': queryInput,
      'query_by': 'content, tags, title, authors',
    }


    console.log("doSearch():")
    console.log("query input text: " + queryInput)
    if (queryInput == null || undefined) return
    let response = await tsSearchClient.multiSearch.perform(search, searchParams);
    console.log(response);
    if ('error' in response.results[0]) {
      console.error("Typesense backend returned an error", response.results[0])
      return
    }
    setSearchResults(response);
    //setResultCount(response.results[0].found)
    //setSearchTime(response.results[0].search_time_ms)
    //r.foreach((e:any) => console.log(e));
    // response.results.forEach((result: any) => (
    //   result.hits.forEach((hit: any) => (
    //     console.log(hit)
    //   ))
    // ));

    return response;
  }

  useEffect(() => {
    doSearch(props.searchContext)
  })

  return (
    <div>
      {searchResults && searchResults.results.length > 0 && searchResults.results[0].hits.length > 0
        ?
        <ol className="search-results-list">
          {
            searchResults.results.map((result: any) => (
              result.hits.map((hit: any) => (
                <li
                  className="search-result"
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
                  {hit.highlights.length > 0 && hit.highlights["conent"]
                    && <span className="search-result-content" dangerouslySetInnerHTML={{ __html: hit.highlights[0].snippet }}></span>
                  }
                  <span className="search-result-content">{hit.document.content}</span>
                </li>
              ))
            ))
          }
        </ol>
        : <div>No Results</div>
      }
    </div>
  )
}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting === "hello")
      console.log(request.highlightedText)
      sendResponse({farewell: "goodbye"});
  }
);


export default App;
