import React, { useState, useEffect } from 'react';
import { Api, WebClippingData, WebClippingsResponse, Model1 } from './client-libs/osobisty-client';
import './sideui.css';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LockClosedIcon } from '@heroicons/react/solid'

function SideUI(props: any) {
  const [isOpen, setIsOpen] = useState(false);
  // const [title, setTitle] = React.useState('');
  // const [headlines, setHeadlines] = React.useState<string[]>([]);
  // const [selectedHit, setSelectedHit] = useState(null);
  // const [clipData, setClipData] = React.useState<WebClippingDataExtended>();

  useEffect(() => {

    // local storage is per origin i.e. scoped to a domian + protocol
    const isOpenKey = localStorage.getItem('isOpen');
    console.log("useeffects " + isOpenKey)

    if (isOpenKey && JSON.parse(isOpenKey).isOpen !== isOpen) {
      setIsOpen(JSON.parse(isOpenKey).isOpen)
    }



    //   });
    // chrome.runtime.onMessage.addListener(
    //   function(request, sender, sendResponse) {
    //     console.log("command message received at extensions")

    //     if (request.command === "updateHighlightInfo") {

    //     }
    //   }
    // );
  }, [props.isOpen, isOpen]);

  const clickHandler = (event: any) => {
    console.log("onclick " + isOpen)
    if (isOpen) {
      localStorage.setItem('isOpen', JSON.stringify({ 'isOpen': false }));
      setIsOpen(false)
    } else {
      localStorage.setItem('isOpen', JSON.stringify({ 'isOpen': true }));
      setIsOpen(true)
    }

  }

  return (

    // .osobisty-side-ui-container {
    //   background-color: var(--primary-bg);
    //   color: var(--primary-text);
    //   overflow-y: auto;
    //   font-family: 'Courier New', Courier, monospace;
    //   font-size: 10pt;
    // }

    // .osobisty-side-ui-container.open {
    // .osobisty-side-ui-container.closed {
    //   position: fixed;

    //   float: right;
    //   /* 
    //   display: inline; */
    //   height: 50px;
    //   width: 50px;
    //   top: 20px;
    //   right: 0px;
    // }
    // }


    <div className={isOpen ? 'h-500 w-400 min-w-400 max-w-600 top-0 right-0 rounded-sm z-top overflow-y-auto fixed float-right font-mono text-xs osobisty-side-ui-container open' : 'h-50 w-50 top-0 right-0 fixed float-right z-top osobisty-side-ui-container closed'}>
      <button id="expandcollaps-button" className="group relative h-6 m-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onClick={clickHandler}>
        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
          {isOpen
            ? <ChevronDoubleRightIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-400" aria-hidden="true" />
            : <ChevronDoubleLeftIcon className="h-5 w-5 text-gray-500 group-hover:text-gray-400" aria-hidden="true" />}
        </span>
      </button>
      {isOpen && <ClipsList />}
    </div>
  );
}

function ClipsList() {
  const [clipsData, setClipsData] = useState({} as WebClippingData);
  useEffect(() => {

    //var port = chrome.runtime.connect();
    window.postMessage({ source: 'SIDEUI', cmd: 'sendClippingData' }, "*");


    window.addEventListener("message", (event: MessageEvent<any>) => {
      console.log("SideUI received message from: " + event.data.source)
      console.log(event)
      // We only accept messages from ourselves
      if (event.source !== window) {
        console.log("Reject! Event source not same window: ");
        console.log(event.source);
        return;
      }

      if (event.data.source && (event.data.source === "CONTENT_SCRIPT")) {
        console.log("CONTENT_SCRIPT")
        if (event.data.cmd && (event.data.cmd === "listHighlights"))
          console.log("Received command: " + event.data.cmd + " from: " + event.data.source);
        console.log(event.data.clippingData);
        if (event.data.clippingData) {
          setClipsData(event.data.clippingData)
        }
        //port.postMessage(event.data.text); 
      }
    }, false);



    // try {
    //   const api = new Api()

    //   const url = window.location.href

    //   api.webclippings.getWebclippings({ page_url: encodeURIComponent(url) })
    //     .then(response => response.json())
    //     .then((data: WebClippingsResponse) => {
    //       console.log("sideui get clips ")
    //       console.log(data.webClippingData)
    //       if (data.webClippingData) {
    //         setClipsData(data.webClippingData);
    //       } else {
    //         throw data.message
    //       }
    //     })
    //     .catch((error) => {
    //       console.error("<ClipsList> Error calling `api.webclippings.getWebclippings()`")
    //       console.error(error)
    //     })
    // } catch (error) {
    //   throw error
    // }
  }, [])


  return (
    <div>

      {/* .pt-12 pl-12 border-l-4 border-solid border-transparent {
  //list-style: none;
  //font-weight: normal;
  //padding: 6px 12px;
  border-left: 3px solid transparent;
}

.pt-12 pl-12 border-l-4 border-solid border-transparent blockquote {
  margin: 1.5em 5px;
  padding: 0.5em 5px;
  border-left: 4px solid var(--search-highlight);
  font-size: 10pt;
  font-family: 'Courier New', Courier, monospace;
  
} */}
      {clipsData && clipsData.clippings
        ? <ol>
          {
            clipsData.clippings.map((clip: Model1) => (
              <li id={clip.id} key={clip.id} className="pt-4 pl-4">
                <blockquote className="ml-3 pl-5 border-l-4 border-green-600 border-solid">{clip.source_content}</blockquote>
                {clip.notes_content && <div id={clip.id + ':note'} className="notes-content">{clip.notes_content}</div>}
              </li>
            ))
          }
        </ol>
        : <div className="text-red-100">Test data
          <ol className="osobisty-side-ui-results">
            <li id="14596" className="pt-4 pl-4">
            <blockquote className="ml-3 pl-5 border-l-4 border-green-600 border-solid">ersal personal search system which I’ve named Osobisty (which means personal or private in Polish). I’ll dive deeper into why I need Osobisty in another </blockquote></li>
            <li id="51324" className="pt-4 pl-4 ">
              <blockquote className="ml-3 pl-5 border-l-4 border-green-600 border-solid">access my curated content both public or private. I currently have private notes (Zettlekasten)</blockquote></li>
          </ol>
        </div>
      }
    </div>

  )
}




export default SideUI;