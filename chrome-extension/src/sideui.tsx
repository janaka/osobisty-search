import React, { useState, useEffect } from 'react';
import { Api, WebClippingData, WebClippingsResponse, Model1 } from './client-libs/osobisty-client';
import './sideui.css';

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

    <div className={isOpen ? 'osobisty-side-ui-container open' : 'osobisty-side-ui-container closed'} onClick={clickHandler}>
      {isOpen
        ? <ClipsList />
        : <div>M</div>
      }
    </div>
  );
}

function ClipsList() {
  const [clipsData, setClipsData] = useState({} as WebClippingData);
  useEffect(() => {

    //var port = chrome.runtime.connect();
    window.postMessage({source: 'SIDEUI', cmd: 'sendClippingData'}, "*");


    window.addEventListener("message", (event:MessageEvent<any>) => {
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
        console.log("Received command: " +event.data.cmd+ " from: " + event.data.source);
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
      {clipsData && clipsData.clippings
       ? <ol className="osobisty-side-ui-results">
          {
            clipsData.clippings.map((clip: Model1) => (
              <li id={clip.id} key={clip.id} className="osobisty-side-ui-result-item"><blockquote>{clip.source_content}</blockquote>
                {clip.notes_content && <div id={clip.id+':note'} className="notes-content">{clip.notes_content}</div>}
              </li>
            ))
          }
        </ol>
        : <div>No highlights!</div>
      }
    </div>

  )
}




export default SideUI;