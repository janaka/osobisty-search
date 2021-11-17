
import { ClipHighlight } from './ClipHighlight'

const doHighlight = async function (selectedText: string, webclippingId?: string): Promise<ClipHighlight> {

    //const sel = selectedText //window.getSelection()

    const promise = new Promise<ClipHighlight>((resolve, reject) => {
        console.log("mouseup event: " + selectedText?.toString())

        if (selectedText != null && selectedText.toString().length > 0) {

            let highlightText: string = selectedText != null ? selectedText.toString() : ""

            console.log("mouseup event: sel?.toString():" + selectedText?.toString() + " highlightText:" + highlightText)
            //TODO: split on linebreak to match across paragraphs

            let pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")
            //let highlightNotFound: boolean = true;
            //let lastHightlightObj: any;

            const clipHighlight = new ClipHighlight(selectedText,pElCollection)
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



const onReceiveMesssage = (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void) => {

    if (msg.command === "highlightSelection") {
        const sel = window.getSelection()?.toString();
        if (sel) {
            console.log(msg)
            console.log(msg.data.clipId)
            doHighlight(sel, msg.data.clipId);
        } else {
            console.error("There's no selection. Selected text is empty!")
        }
    }

    if (msg.command === "clipSelection") {
        const sel = window.getSelection()?.toString();
        if (sel) {
            sendResponse({
                selectedText: sel,
                page_url: window.location.href.toString()
                //selectedTextHtml: 
            })
        } else {
            console.error("There's no selection. Selected text is empty!")
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
