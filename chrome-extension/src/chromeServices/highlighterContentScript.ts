import { ClipHighlight } from './ClipHighlight'
import { WebClippingData } from '../client-libs/osobisty-client'
import { WebClippingDataExtended } from '../types/WebClippingDataExtended';
import { injectSideUI, toggleSideUI } from './manageSideUI'

let clipData: WebClippingData;



const getPageClippings = () => {
    console.log("Send message command=getWebClippings, traceId=12111")
    chrome.runtime.sendMessage({ command: "getWebClippings", page_url: window.location.href.toString(), traceId: '12111' }, (response) => { });
    // background script send a message with `command=highlightClips`

    console.log("on dom load fire getPageClippings()")
}


const injectEventHandler = () => {
    // inject the even handler into the page as this content script isn't directly available to the page.
    const s = document.createElement("script");

    s.src = chrome.runtime.getURL('./static/js/osobisty.js');
    // s.onload = function() {
    //     s.remove();
    // };
    (document.head || document.documentElement).appendChild(s);
}





const doHighlight = async function (selectedText: string, clipId?: string): Promise<ClipHighlight> {

    //const sel = selectedText //window.getSelection(

    const promise = new Promise<ClipHighlight>((resolve, reject) => {

        console.log("mouseup event: " + selectedText?.toString())

        if (selectedText != null && selectedText.toString().length > 0) {

            let highlightText: string = selectedText != null ? selectedText.toString() : ""

            console.log("mouseup event: sel?.toString():" + selectedText?.toString() + " highlightText:" + highlightText)
            //TODO: split on linebreak to match across paragraphs

            const pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")

            const clipHighlight = new ClipHighlight(selectedText, pElCollection, clipId, false)

            if (!clipHighlight.highlightMatchFound) {
                console.error("//// Error Message Start ///")
                console.log("highlight match didn't work, not found")
                console.log('selectedText: "' + clipHighlight.clipText + '"')
                console.log('highlight regex: "' + clipHighlight.highlightRegExObj + '"')
                console.log('highlight text escaped: "' + clipHighlight.highlightTextEscaped + '"')
                console.log(' innerHtml: "' + clipHighlight.highlightedHtml + '"')

                reject(new Error("`@selectedText` couldn't be found in HTML."))
            } else {
                //clipHighlight.applyHighlight()
                resolve(clipHighlight)
            }
        } else {
            reject(new Error("`@selectedText` was null or empty"))
        }

    })
    return promise
}




const undoHighlight = function (event: MouseEvent) {
    //console.log(event.)
}



const onReceiveMesssage = async (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void) => {

    console.log("chrome.onMessage() handling cmd=" + msg.command + ", traceId=" +msg.traceId)

    if (msg.command === "highlightSelection") {
        console.log("handling cmd=" + msg.command+ ", traceId=" +msg.traceId)
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
            console.log(msg)
            console.log(msg.data.clipId)
            const clipHighlight = await doHighlight(selectedText.trim(), msg.data.clipId);
            clipHighlight.applyHighlight()
        } else {
            console.error("There's no selection. Selected text is empty!")
        }
    }

    if (msg.command === "clipSelection") {
        console.log("handling cmd=" + msg.command+ ", traceId=" +msg.traceId)
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {

            sendResponse({
                selectedText: selectedText.trim(),
                page_url: window.location.href.toString(),
            })
        } else {
            console.error("There's no selection. Selected text is empty!")
        }
    }

    if (msg.command=== "toggleSideUI") {
        // inject the the SideUI or Remove it
        console.log("handling cmd=" + msg.command+ ", traceId=" +msg.traceId)
        const isEnabledState = toggleSideUI() 
        console.log("SideUI enabled="+isEnabledState+ ",  traceId=" +msg.traceId)
    }


    if (msg.command === "sendClipPageUrl") {
        console.log("handling cmd=" + msg.command+ ", traceId=" +msg.traceId)
        sendResponse({
            page_url: encodeURIComponent(window.location.href.toString())
        })
    }

    if (msg.command === "sendClipData") {
        sendResponse({ data: clipData }) // clipData global should have data since the page should already be loaded  
    }

    // if (msg.command === "saveClipDataCmdResponse") {
    //     window.postMessage({ source: 'CONTENT_SCRIPT', cmd: 'saveClipDataCmdResponse', msg: msg.msg }, "*");
    // }

    if (msg.command === "highlightClips") {
        console.log("handling cmd=" + msg.command + ", traceId=" +msg.traceId)
        clipData = msg.data;
        console.log(msg)
        let matchMissedCount: number = 0;
        let noMatchClips: string[] = [];
        if (clipData.clippings) {
            const pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")
            clipData.clippings.forEach(clip => {
                if (clip.source_content) {
                    const clipHighlight = new ClipHighlight(clip.source_content, pElCollection, clip.id)
                    if (clipHighlight.highlightMatchFound) {
                        clipHighlight.applyHighlight()
                        const mark = clipHighlight.RegExpMatchedHtmlElement?.getElementsByClassName("ob-highlight-952")[0]
                        if (mark) {
                            mark.className = mark.className + " someotherclass";
                        }
                    } else {
                        // track missed matches and report
                        matchMissedCount++;
                        noMatchClips.push(clip.source_content)
                    }
                }
            });

            console.log("Number of saved clips that didn't match on the page: " + matchMissedCount)
            noMatchClips.forEach(e => {
                console.log(e)
            });
            const clipDataE: WebClippingDataExtended = clipData as WebClippingDataExtended
            clipDataE.numberClipsHighlighted = clipData.clippings.length - matchMissedCount
            clipDataE.totalClips = clipData.clippings.length
            clipDataE.numberClipsNotHighlighted = matchMissedCount

            //sendHighlightDataToExtension(clipDataE)
        }

    }
}

/**
* Fired when a message is received from either an extension process or a background script.
*/
//chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
chrome.runtime.onMessage.addListener(onReceiveMesssage);


const messageEventHandler = (event: MessageEvent<any>) => {
    console.log("ContentScript received message from: " + event.data.source + " traceId="+event.data.traceId)
    console.log("traceId:"+event.data.traceId, event)
    // We only accept messages from ourselves
    if (event.source !== window) {
        console.log("Reject! Event source not same window: " + event.source)
        return;
    }

    if (event.data.source && (event.data.source === "SIDEUI")) {
        if (event.data.cmd) {
            console.log("Received command: " + event.data.cmd + " from: " + event.data.source + "traceid=" + event.data.traceId);

            switch (event.data.cmd) {
                case "sendClippingData":
                    console.log("Response with clipping data from contentscript to sideui. traceId=" + event.data.traceId);
                    // don't need to hit the background script because the content script already had the clipData from the load event that defintiely already happened
                    window.postMessage({ source: 'CONTENT_SCRIPT', cmd: 'listHighlights', clippingData: clipData, traceId: event.data.traceId }, "*");
                    break;
                case "saveClipData":
                    // relay message to background script
                    console.log("Content script send command `saveClipData` to background script. traceId=" + event.data.traceId)
                    console.log(event.data.data)
                    chrome.runtime.sendMessage({ command: "saveClipData", data: event.data.data, traceId: event.data.traceId}, (response) => { 
                        window.postMessage({ source: 'CONTENT_SCRIPT', cmd: 'saveClipDataCmdResponse', msg: response, traceId: response.traceId}, "*");
                    });
                    break;
            }
        }
    }

}

// handle commands from the SideUI
window.addEventListener("message", messageEventHandler, false);


/**
 * Thing you want to happen on pageload go here.
 */
if (document.readyState === 'loading') {  // Loading hasn't finished yet
    console.log("readyState=" + document.readyState)
    injectEventHandler();
    document.addEventListener('DOMContentLoaded', getPageClippings);
    injectSideUI();

} else {  // `DOMContentLoaded` has already fired
    console.log("readState not loading")
    injectEventHandler();
    getPageClippings();
    //renderInlineMenu();
    injectSideUI();
}



// const sendHighlightDataToExtension = (data: WebClippingDataExtended) => {
//     chrome.runtime.sendMessage({ command:"updateHighlightInfo",  data: data }, (response) => {});
//     console.log("send command to ext")
// }




