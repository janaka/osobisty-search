import { useEffect, useState } from "react";
import { Model1, WebClippingData } from "../client-libs/osobisty-client";
import Clip from "./clip";

function ClipsList() {
  const [clipsData, setClipsData] = useState({} as WebClippingData);
  useEffect(() => {

    //ask the content script which will ask the background script to execute the `cmd`
    window.postMessage({ source: 'SIDEUI', cmd: 'sendClippingData' }, "*");


    window.addEventListener("message", (event: MessageEvent<any>) => {
      console.log("<SideUI><ClipsList> received message from: " + event.data.source)
      console.log(event)
      // We only accept messages from ourselves
      if (event.source !== window) {
        console.log("Reject! Event source not same window: ");
        console.log(event.source);
        return;
      }

      if (event.data.source && (event.data.source === "CONTENT_SCRIPT")) {
        console.log("CONTENT_SCRIPT")
        if (event.data.cmd && (event.data.cmd === "listHighlights")) {
          console.log("Received command: " + event.data.cmd + " from: " + event.data.source);
          console.log(event.data.clippingData);
          if (event.data.clippingData) {
            setClipsData(event.data.clippingData)
          } else {
            // some test data so we can do local dev
            console.log("setClipsData=testClippingData")
            const testClippingData: WebClippingData = {
              clippings: [
                { id: '9208749', source_content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '8208749', source_content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '9608749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '9618749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '7608749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '6608749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' },
                { id: '2608749', source_content: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born ', notes_content: 'Some notes about why I found this clip interesting.' }
              ]
            }
            setClipsData(testClippingData)
          }
        }
        //port.postMessage(event.data.text); 
      }
    }, false);
  }, [])


  return (
    <div>
      {
        clipsData && clipsData.clippings &&
        <ol className="text-primary-300">
          {
            clipsData.clippings.map((clip: Model1) => (
              <li id={clip.id} key={clip.id} className="pb-4 osobisty-side-ui-result-item">
                <Clip clipData={{ clip: clip, page_url: clipsData.page_url, page_id: clipsData.id }} />
              </li>
            ))
          }
        </ol>
      }
    </div>

  )
}

export default ClipsList;