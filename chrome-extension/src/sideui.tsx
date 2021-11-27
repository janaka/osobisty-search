import React, { useState, useEffect } from 'react';
import { Api, WebClippingData, WebClippingsResponse, Model1, Clippings } from './client-libs/osobisty-client';
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


    <div className={isOpen ? 'h-500 w-400 min-w-400 max-w-600 p-2 pb-3 top-0 right-0 rounded-sm z-top overflow-y-auto fixed float-right font-mono text-xs bg-primary-700 osobisty-side-ui-container open' : 'h-50 w-30 pt-2 top-0 right-0 fixed float-right z-top closed'}>
      <button id="expandcollaps-button" className="group relative h-6 mb-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-300 bg-primary-600 hover:bg-primary-700" onClick={clickHandler}>
        <span className="absolute left-0 inset-y-0 flex items-center">
          {isOpen
            ? <ChevronDoubleRightIcon className="h-8 w-8 text-primary-500 group-hover:text-secondary-300" aria-hidden="true" />
            : <ChevronDoubleLeftIcon className="h-8 w-8 text-primary-500 group-hover:text-secondary-300" aria-hidden="true" />}
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
        } else {
          // some test data so we can do local dev
          const testClippingData: WebClippingData = {
            clippings: [
              { id: '9208749', source_content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore', notes_content: 'Some notes about why I found this clip interesting.' },
              { id: '8208749', source_content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,', notes_content: 'Some notes about why I found this clip interesting.' },
              { id: '9608749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' }
            ]
          }
          setClipsData(testClippingData)
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
      {
        clipsData && clipsData.clippings &&
        <ol className="text-primary-300">
          {
            clipsData.clippings.map((clip: Model1) => (
              <li id={clip.id} key={clip.id} className="pt-4 pl-1 osobisty-side-ui-result-item">
                <Clip clipData={clip} />
              </li>
            ))
          }
        </ol>
      }
    </div>

  )
}

function Clip(props: any) {

  const onclickHandler = (event: any) => {
    console.log("click to edit")
    console.log(event.target.contenteditable)
    event.target.contenteditable = true;
  }
  return (
    <div className="bg-primary-600 shadow overflow-hidden sm:rounded-lg">
      {props.clipData && props.clipData.source_content &&
        <div className="py-3 sm:px-2">
          <blockquote className="ml-1 pl-3 border-l-4 border-secondary-700 border-solid">
            {props.clipData.source_content}
          </blockquote>
        </div>
      }


      <div>
        <dt className="pt-1 px-3 text-primary-400">Notes<div className="border-b border-primary-500"></div></dt>
        <dd className="p-3 " onClick={onclickHandler}>{props.clipData && props.clipData.notes_content}</dd>
      </div>

    </div>
  )
}


export default SideUI;