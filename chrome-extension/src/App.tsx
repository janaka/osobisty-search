import React, { useEffect, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
//import { DOMMessage, DOMMessageResponse } from './types';
import { SearchClient as TypesenseSearchClient } from "typesense";
import { WebClippingDataExtended } from './types/WebClippingDataExtended';

function App() {
  const [title, setTitle] = React.useState('');
  const [headlines, setHeadlines] = React.useState<string[]>([]);
  const [selectedHit, setSelectedHit] = useState(null);
  const [clipData, setClipData] = React.useState<WebClippingDataExtended>();

  useEffect(() => {
    /**
     * We can't use "chrome.runtime.sendMessage" for sending messages from React.
     * For sending messages from React we need to specify which tab to send it to.
     */
    // chrome.tabs && chrome.tabs.query({
    //   active: true,
    //   currentWindow: true
    // }, tabs => {
    //   /**
    //    * Sends a single message to the content script(s) in the specified tab,
    //    * with an optional callback to run when a response is sent back.
    //    *
    //    * The runtime.onMessage event is fired in each content script running
    //    * in the specified tab for the current extension.
    //    */
    //   chrome.tabs.sendMessage(
    //     tabs[0].id || 0,
    //     { type: 'GET_DOM' } as DOMMessage,
    //     (response: DOMMessageResponse) => {
    //       setTitle(response.title);
    //       setHeadlines(response.headlines);
    //     });
    //     console.log("Fired - chrome.tabs.sendMessage()")
    // });
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log("command message received at extensions")
        
        if (request.command === "updateHighlightInfo") {
          const data = request.data as WebClippingDataExtended
          setClipData(data)  
          console.log(request)
        }
      }
    );
  },[]);
  return (
    <div className="App">
      <header className="App-header">
        Osobisty
      </header>
      <div>
        {clipData?.numberClipsHighlighted} Clips of {clipData?.totalClips} highlighted. 
        <OsobistyResults searchContext={title} selectedHit={selectedHit} setSelectedHit={setSelectedHit}/>
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

  console.log("<OsobistyResults> reloaded")

  useEffect(() => {
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

    doSearch(props.searchContext)
  }, [props.searchContext, tsSearchClient.multiSearch])

  return (
    <div className="search-results">
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





export default App;
