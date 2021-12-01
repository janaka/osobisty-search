import { useEffect } from "react";
import { Model1 } from "../client-libs/osobisty-client";
import useDebounce from "../hooks/useDebounce";


function Clip(props: any) {


  const [debouncedNotesContentsValue, currentNotesContentsValue, setCurrentNotesContentsValue] = useDebounce('', 300)

  useEffect(() => {
    setCurrentNotesContentsValue(props.clipData.clip.notes_content)

  }, [setCurrentNotesContentsValue, props.clipData.clip.notes_content]);

  useEffect(() => {
    window.addEventListener("message", saveClipNoteCmdResponseHandler, false);
  }, []);



  const onInputHandler = (event: any) => {
    // auto expand the text box based on the content
    // doesn't work yet. Following this example https://css-tricks.com/auto-growing-inputs-textareas/
    //event.target.dataset.value = event.target.value

    setCurrentNotesContentsValue(event.target.value)

    //TODO: FIX deleting all the content of a note doesn't work

  }

  useEffect(() => {
    const clip: Model1 = props.clipData.clip
    clip.notes_content = debouncedNotesContentsValue
    
    saveClipNote({ clip: clip, page_url: props.clipData.page_url, page_id: props.clipData.page_id });
  }, [debouncedNotesContentsValue, props.clipData.clip, props.clipData.page_id, props.clipData.page_url]);



  return (
    <div className="bg-primary-600 shadow overflow-hidden sm:rounded-lg">
      {props.clipData && props.clipData.clip && props.clipData.clip.source_content &&
        <div className="py-3 sm:px-2">
          <blockquote className="ml-1 pl-3 border-l-4 font-mono not-italic opacity-100 antialiased text-sm text-primary-300 border-secondary-700 border-solid">
            {props.clipData.clip.source_content}
          </blockquote>
        </div>
      }
      {props.clipData && props.clipData.clip &&
        <div className="min-h-full">
          <dt className="pt-1 px-3 text-primary-400">Notes<div className="border-b border-primary-500"></div></dt>
          <dd className="p-3 min-h-full">
            <textarea className="w-full min-h-full bg-transparent resize-none focus:outline-none font-mono text-primary-300 focus:bg-primary-500" onInput={onInputHandler} >{props.clipData.clip.notes_content}</textarea>
          </dd>
        </div>
      }
    </div>
  )
}

const saveClipNote = (clipData: { clip: Model1, page_url: string, page_id: string }) => {
  console.log("<clip> send saveClipData command");
  console.log("note=  " + clipData.clip.notes_content);
  window.postMessage({ source: 'SIDEUI', cmd: 'saveClipData', data: clipData }, "*");
}

const saveClipNoteCmdResponseHandler = (event: MessageEvent<any>) => {
  console.log("<Clip> received cmd=" + +  " from: " + event.data.source)
  console.log(event)
  // We only accept messages from ourselves
  if (event.source !== window) {
    console.log("Reject! Event source not same window: ");
    console.log(event.source);
    return;
  }

  if (event.data.source && (event.data.source === "CONTENT_SCRIPT")) {
    if (event.data.cmd && (event.data.cmd === "saveClipDataCmdResponse"))
      console.log("Received command: " + event.data.cmd + " from: " + event.data.source);
    console.log(event.data.msg);
  }
}

export default Clip;