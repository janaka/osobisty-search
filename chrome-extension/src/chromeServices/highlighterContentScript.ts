import { ClipHighlight } from './ClipHighlight'
import { WebClippingData } from '../client-libs/osobisty-client'
import { WebClippingDataExtended } from '../types/WebClippingDataExtended';

let clipData: WebClippingData;


const getPageClippings = () => {
    chrome.runtime.sendMessage({ command: "getWebClippings", page_url: window.location.href.toString() }, (response) => { });
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

const renderSideUI = () => {
    console.log("render side ui")
    try {

        fetch(chrome.runtime.getURL('/asset-manifest.json')).then(r => r.text()).then(reactAssetManifest => {



            if (!document.getElementById("osobisty-side-ui-root")) {
                // not running in standalone deve mode.
                const reactCsslinkEl = document.createElement("link")
                reactCsslinkEl.href = chrome.runtime.getURL(JSON.parse(reactAssetManifest).files["main.css"])
                reactCsslinkEl.rel = "stylesheet"
                console.log(reactCsslinkEl.href)
                document.head.insertAdjacentElement('afterbegin', reactCsslinkEl) // 'afterbegin': Just inside the element, before its first child.

                const reactScript = document.createElement("script")
                reactScript.src = chrome.runtime.getURL("/static/js/main.js")
                document.body.insertAdjacentElement('afterbegin', reactScript);
                const reactRootDiv = document.createElement("div")
                reactRootDiv.className = "z-top"
                reactRootDiv.id = "osobisty-side-ui-root"
                document.body.insertAdjacentElement('afterbegin', reactRootDiv); // 'afterbegin': Just inside the element, before its first child
                // not using innerHTML as it would break js event listeners of the page
            }
        });
    } catch (error) {
        throw error
    }
}

if (document.readyState === 'loading') {  // Loading hasn't finished yet
    console.log("readyState=" + document.readyState)
    injectEventHandler();
    document.addEventListener('DOMContentLoaded', getPageClippings);
    renderSideUI();

} else {  // `DOMContentLoaded` has already fired
    console.log("readState not loading")
    injectEventHandler();
    getPageClippings();
    //renderInlineMenu();
    renderSideUI();

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

    console.log("chrome.onMessage() handling cmd=" + msg.command)

    if (msg.command === "highlightSelection") {

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
        console.log("handling cmd=" + msg.command)
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



    if (msg.command === "sendClipPageUrl") {
        console.log("handling cmd=" + msg.command)
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
        console.log("handling cmd=" + msg.command)
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

const messageEventHandler = (event: MessageEvent<any>) => {
    console.log("ContentScript received message from: " + event.data.source)
    console.log(event)
    // We only accept messages from ourselves
    if (event.source !== window) {
        console.log("Reject! Event source not same window: " + event.source)
        return;
    }

    if (event.data.source && (event.data.source === "SIDEUI")) {
        if (event.data.cmd) {
            console.log("Received command: " + event.data.cmd + " from: " + event.data.source);

            switch (event.data.cmd) {
                case "sendClippingData":
                    console.log("Response with clipping data from contentscript to sideui");
                    // don't need to hit the background script because the content script already had the clipData from the load event that defintiely already happened
                    window.postMessage({ source: 'CONTENT_SCRIPT', cmd: 'listHighlights', clippingData: clipData }, "*");
                    break;
                case "saveClipData":
                    // relay message to background script
                    console.log("Content script send command `saveClipData` to background script.")
                    console.log(event.data.data)
                    chrome.runtime.sendMessage({ command: "saveClipData", data: event.data.data }, (response) => { 
                        window.postMessage({ source: 'CONTENT_SCRIPT', cmd: 'saveClipDataCmdResponse', msg: response}, "*");
                    });
                    break;
            }
        }
    }

}



// const sendHighlightDataToExtension = (data: WebClippingDataExtended) => {
//     chrome.runtime.sendMessage({ command:"updateHighlightInfo",  data: data }, (response) => {});
//     console.log("send command to ext")
// }

/**
* Fired when a message is received from either an extension process or a background script.
*/
//chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
chrome.runtime.onMessage.addListener(onReceiveMesssage);


// handle commands from the SideUI
window.addEventListener("message", messageEventHandler, false);


