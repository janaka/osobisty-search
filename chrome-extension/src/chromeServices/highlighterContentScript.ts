import { ClipHighlight } from './ClipHighlight'
import { WebClippingData } from '../client-libs/osobisty-client'

const doHighlight = async function (selectedText: string, clipId?: string): Promise<ClipHighlight> {

    //const sel = selectedText //window.getSelection(

    const promise = new Promise<ClipHighlight>((resolve, reject) => {
        console.log("mouseup event: " + selectedText?.toString())

        if (selectedText != null && selectedText.toString().length > 0) {

            let highlightText: string = selectedText != null ? selectedText.toString() : ""

            console.log("mouseup event: sel?.toString():" + selectedText?.toString() + " highlightText:" + highlightText)
            //TODO: split on linebreak to match across paragraphs

            const pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")
            //let highlightNotFound: boolean = true;
            //let lastHightlightObj: any;

            const clipHighlight = new ClipHighlight(selectedText, pElCollection, clipId)
            // for (let i = 0; i < pElCollection.length; i++) {
            //     const pEl = pElCollection[i];

            //     const highlightObj: highlightMarkupResult = generateHighlightMarkup(highlightText, pEl.innerHTML, webclippingId)

            //     if (highlightObj.highlightMatchFound) {
            //         highlightNotFound = false;
            //         pEl.innerHTML = highlightObj.highlightedHtml
            //         break
            //     }
            //     lastHightlightObj = highlightObj
            // }

            if (!clipHighlight.highlightMatchFound) {
                console.log("highlight match didn't work, not found")
                console.log("highlight regex: " + clipHighlight.highlightRegExObj)
                console.log("highlight text escaped: " + clipHighlight.highlightTextEscaped)
                console.log("innerHtml: " + clipHighlight.highlightedHtml)

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
        console.log("handling cmd="+msg.command)
        const sel = window.getSelection()?.toString();
        if (sel) {
            console.log(msg)
            console.log(msg.data.clipId)
            const clipHighlight = await doHighlight(sel, msg.data.clipId);
            clipHighlight.applyHighlight()
        } else {
            console.error("There's no selection. Selected text is empty!")
        }
    }

    if (msg.command === "clipSelection") {
        console.log("handling cmd="+msg.command)
        const selectedText = window.getSelection()?.toString();
        if (selectedText) {
            
            sendResponse({
                selectedText: selectedText,
                page_url: window.location.href.toString(),
            })
        } else {
            console.error("There's no selection. Selected text is empty!")
        }
    }


    
    if (msg.command === "sendClipPageUrl") {
        console.log("handling cmd="+msg.command)
        sendResponse({
            page_url: encodeURIComponent(window.location.href.toString())
        })
    }

    if (msg.command === "highlightClips") {
        console.log("handling cmd="+msg.command)
        const clipData: WebClippingData = msg.data;
        console.log(msg)
        if (clipData.clippings) {
            const pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")
            clipData.clippings.forEach(clip => {
                if (clip.source_content) {
                    const clipHighlight = new ClipHighlight(clip.source_content, pElCollection, clip.id) 
                    if (clipHighlight.highlightMatchFound) {
                        clipHighlight.applyHighlight()
                    }
                }
            });
        }

    }
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
