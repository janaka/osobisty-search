import { ClipHighlight } from './ClipHighlight'
import { WebClippingData } from '../client-libs/osobisty-client'
import { WebClippingDataExtended } from '../types/WebClippingDataExtended';
import { link } from 'fs';

let clipData: WebClippingData;


const getPageClippings = () => {
    chrome.runtime.sendMessage({ command: "getWebClippings", page_url: window.location.href.toString() }, (response) => { });
    // background script send a message with `command=highlightClips`

    console.log("on dom load fire getPageClippings()")
}

// const hovermenuClickHandler = (event:any) => {
//     event.target.style.color = "red"
//     console.log("fire handler")
// }


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


            //const match = indexhtml.match(new RegExp('<link href="(.*?)" rel="stylesheet">?')) //TODO: switch this to get the url from asset-manifest.json

            //let cssLinkStr: string = "";
            
                
                //cssLinkStr = match[1]
                
                const reactCsslinkEl = document.createElement("link")
                reactCsslinkEl.href = chrome.runtime.getURL(JSON.parse(reactAssetManifest).files["main.css"])
                reactCsslinkEl.rel = "stylesheet"
                console.log(reactCsslinkEl.href)
                document.head.insertAdjacentElement('afterbegin', reactCsslinkEl) // 'afterbegin': Just inside the element, before its first child.
            

            const reactScript = document.createElement("script")
            reactScript.src = chrome.runtime.getURL("/static/js/main.js")
            document.body.insertAdjacentElement('afterbegin', reactScript);
            const reactRootDiv = document.createElement("div")
            reactRootDiv.id = "osobisty-side-ui-root"
            document.body.insertAdjacentElement('afterbegin', reactRootDiv); // 'afterbegin': Just inside the element, before its first child

//TODO: try calling before page render or something
            //document.body.insertBefore(sideUIContainer, document.body.firstChild)
            // not using innerHTML as it would break js event listeners of the page
        });

        //<link href="/static/css/main.d4627c23.css" rel="stylesheet">

    } catch (error) {
        throw error
    }
}

if (document.readyState === 'loading') {  // Loading hasn't finished yet
    console.log("readyState=" + document.readyState)
    injectEventHandler();
    document.addEventListener('DOMContentLoaded', getPageClippings);
    renderSideUI();

    //renderInlineMenu();


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

    if (msg.command === "highlightSelection") {
        console.log("handling cmd=" + msg.command)
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

// const sendHighlightDataToExtension = (data: WebClippingDataExtended) => {
//     chrome.runtime.sendMessage({ command:"updateHighlightInfo",  data: data }, (response) => {});
//     console.log("send command to ext")
// }

/**
* Fired when a message is received from either an extension process or a background script.
*/
//chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
chrome.runtime.onMessage.addListener(onReceiveMesssage);
