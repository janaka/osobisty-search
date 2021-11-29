import { useEffect } from "react";
import { Webclipping, WebClippingData } from "../client-libs/osobisty-client";
import { WebClippingDataExtended } from "../types/WebClippingDataExtended";

function Clip(props: any) {

  useEffect(() => {
    

    window.addEventListener("message", saveClipNoteCmdResponseHandler, false);

  }, []);

  const onclickHandler = (event: any) => {
    console.log("click to edit")
    console.log(event.target.contenteditable)
    event.target.contenteditable = true;
  };

  const oninputHandler = async (event: any) => {
    // auto expand the text box based on the content
    // doesn't work yet. Following this example https://css-tricks.com/auto-growing-inputs-textareas/
    event.target.dataset.value = event.target.value
    //const note_content = event.target.value

    const clipData:Webclipping = props.clipData
    clipData.notes_content = event.target.value

    saveClipNote(clipData);

  };

  return (
    <div className="bg-primary-600 shadow overflow-hidden sm:rounded-lg">
      {props.clipData && props.clipData.source_content &&
        <div className="py-3 sm:px-2">
          <blockquote className="ml-1 pl-3 border-l-4 font-mono not-italic opacity-100 antialiased text-sm text-primary-300 border-secondary-700 border-solid">
            {props.clipData.source_content}
          </blockquote>
        </div>
      }
      <div className="min-h-full">
        <dt className="pt-1 px-3 text-primary-400">Notes<div className="border-b border-primary-500"></div></dt>
        <dd className="p-3 min-h-full" onClick={onclickHandler}>
          <textarea className="w-full min-h-full bg-transparent resize-none focus:outline-none font-mono text-primary-300 focus:bg-primary-500" onInput={oninputHandler} >{props.clipData && props.clipData.notes_content}</textarea>
        </dd>
      </div>

    </div>
  )
}

const saveClipNote = (clipData: Webclipping) => {
  window.postMessage({ source: 'SIDEUI', cmd: 'saveClipNoteData', data: clipData}, "*");
}

const saveClipNoteCmdResponseHandler = (event: MessageEvent<any>) => {
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
    if (event.data.cmd && (event.data.cmd === "saveClipNoteDataCmdResponse"))
      console.log("Received command: " + event.data.cmd + " from: " + event.data.source);
    console.log(event.data.clippingData);

  }

  export default Clip;