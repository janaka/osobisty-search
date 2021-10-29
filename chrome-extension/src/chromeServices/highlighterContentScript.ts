import { DOMMessage, DOMMessageResponse } from '../types';
import { generateHighlightMarkup } from './utils'




const doHighlight = async function (event: MouseEvent) {

    let sel = window.getSelection()

    console.log("mouseup event: " + sel?.toString())

    if (sel != null && sel.toString().length > 0) {
        let highlightText: string = sel != null ? sel.toString() : ""

        console.log("mouseup event: sel?.toString():" + sel?.toString() + " highlightText:" + highlightText)
        //TODO: split on linebreak to match across paragraphs

        let pElCollection: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")
        let highlightNotFound: boolean = true;
        let lastHightlightObj: any;

        for (let i = 0; i < pElCollection.length; i++) {
            const pEl = pElCollection[i];

            const highlightObj = generateHighlightMarkup(highlightText, pEl.innerHTML)

            if (highlightObj.highlightMatchFound) {
                highlightNotFound = false;
                pEl.innerHTML = highlightObj.highlightedHtml
                break
            }
            lastHightlightObj = highlightObj
        }

        if (highlightNotFound) {
            console.log("highlight match didn't work, not found")
            console.log("highlight regex: " + lastHightlightObj.highlightRegExObj)
            console.log("highlight text escaped: " + lastHightlightObj.highlightTextEscaped)
            console.log("innerHtml: " + lastHightlightObj.highlightedHtml)
        } else {
            //save highlight



            chrome.runtime.sendMessage(
                {
                    messageName: "postWebClipping",
                    messageData: highlightText
                }, (response) => {
                    console.log(response)
                });
        }

    }
}




const undoHighlight = function (event: MouseEvent) {
    //console.log(event.)
}



// Function called when a new message is received
const messagesFromReactAppListener = (
    msg: DOMMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: DOMMessageResponse) => void) => {

    console.log('[content.js]. Message received', msg);

    const headlines = Array.from(document.getElementsByTagName<"h1">("h1"))
        .map(h1 => h1.innerText);

    // Prepare the response object with information about the site
    const response: DOMMessageResponse = {
        title: document.title,
        headlines
    };

    sendResponse(response);
}

// chrome.browserAction.onClicked.addListener(function(tab) {
//     chrome.tabs.sendRequest(tab.id, {method: "getSelection"}, function(response){
//        sendServiceRequest(response.data);
//     });
//   });

//   function sendServiceRequest(selectedText:any) {
//     var serviceCall = 'http://www.google.com/search?q=' + selectedText;
//     chrome.tabs.create({url: serviceCall});
//   }


const highlightHandler = (event: MouseEvent) => {
    console.log("sfsf")
    doHighlight(event);

}

document.addEventListener('mouseup', highlightHandler);
document.addEventListener('click', undoHighlight);

/**
* Fired when a message is sent from either an extension process or a content script.
*/
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

