import { ClipHighlight } from './ClipHighlight'
import { WebClippingData } from '../client-libs/osobisty-client'
import { WebClippingDataExtended } from '../types/WebClippingDataExtended';

const getPageClippings = () => {
    chrome.runtime.sendMessage({ command: "getWebClippings",  page_url: window.location.href.toString() }, (response) => {});
    console.log("on dom load fire getPageClippings()")
}

if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', getPageClippings);
} else {  // `DOMContentLoaded` has already fired
    getPageClippings();
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

    if (msg.command === "highlightClips") {
        console.log("handling cmd=" + msg.command)
        const clipData: WebClippingData = msg.data;
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
            
            sendHighlightDataToExtension(clipDataE)
        }

    }
}

const sendHighlightDataToExtension = (data: WebClippingDataExtended) => {
    chrome.runtime.sendMessage({ command:"updateHighlightInfo",  data: data }, (response) => {});
    console.log("send command to ext")
}


// const highlightHandler = (event: MouseEvent) => {
//     console.log("sfsf")
//     doHighlight(event);

// }

//document.addEventListener('mouseup', highlightHandler);
//document.addEventListener('click', undoHighlight);

/**
* Fired when a message is received from either an extension process or a background script.
*/
//chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
chrome.runtime.onMessage.addListener(onReceiveMesssage);
