import { DOMMessage, DOMMessageResponse } from '../types';
import {generateHighlightMarkup} from './utils'

// const doHighlight2 = function (event: MouseEvent) {

//     let sel = window.getSelection()

//     console.log("mouseup event: " + sel?.toString())
//     console.log("anchor node type: "+sel?.anchorNode?.nodeType+sel?.anchorNode?.nodeName +  ", anchor offset: " + sel?.anchorOffset)

//     console.log("focus node type: "+sel?.focusNode?.nodeType + sel?.focusNode?.nodeName + ", focus offset: " + sel?.focusOffset)


// }

const doHighlight = function (event: MouseEvent) {

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
        }
    }
}




const undoHighlight = function (event: MouseEvent) {
    //console.log(event.)
}

function topElementWithHighlightText(El: Element, highlight: string): {element: Element, position: number, hasChildren: boolean, spansElements:boolean} | null {
    // let te = null
    // const p: number

    let highlightElement: {element: any, position: number, hasChildren: boolean, spansElements:boolean} = {element: null, position: -1, hasChildren:false, spansElements:false}

    for (let k = 0; k < El.children.length; k++) {
        const e: any = El.children[k];
        console.log("nodename : " + e.nodeName + ", type:" + e.nodeType)
        if (e.nodeName !== "SCRIPT") {
            console.log(e.innerText)
            console.log(e.innerHTML)
            const p1  = e.innerText.indexOf(highlight)
            if (p1 > -1) { // highlight is in this node
                console.log("highlight found at pos " + p1)
                const p2  = e.innerText.indexHTML(highlight)
                if (p2>-1) { // doesn't span elements
                    // add highligh markup
                } else {

                }
            }
        }
    }
    // for (let k = 0; k < El.children.length; k++) {
    //     const e = El.children[k];
    //     console.log("nodename : "+e.nodeName + ", type:" + e.nodeType)
    // }
    return highlightElement
}
// \s?<?\/?[a-zA-Z]*>?\s?
//\(aka\s?<?\/?.*?>?\s?The\s?<?\/?.*?>?\s?Sephist\s?<?\/?.*?>?\s?\)

//aka\s?<?.*?>?\s??The\s?<?.*?>?\s??Sephist\s?<?.*?>\s??the
function spaningHighlightText(El: Element, highlight: string): string {
    for (let j = 0; j < El.children.length; j++) {
        const child: Element = El.children[j];
        console.log(child.nodeName)
        if (child.nodeName === "MARK") {
            console.log("already highlighted. remove and rehighlight")
            return ""
        }
        const t = highlight.indexOf(child.innerHTML)
        if (t > -1) { // crosses this element

            const highlighttextBeforeNode = highlight.substr(0, t)
            const highlighttextAfterNode = highlight.substring(t + child.innerHTML.length, highlight.length)
            highlight = highlighttextBeforeNode + child.outerHTML + highlighttextAfterNode
        }
    }
    return highlight
}

function highlightWithinChild(tag: Element, highlightText: string) {

    let found: string = "NONE"

    for (let i = 0; i < tag.children.length; i++) {
        const e = tag.children[i];
        const p: number = e.innerHTML.indexOf(highlightText)

        if (p > -1) {
            found = e.nodeName
            if (e.children.length > 0) {
                found = highlightWithinChild(e, highlightText);
            }
        }
    }
    return found
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


const highlightHandler  = (event: MouseEvent) => {
    doHighlight(event);

}

document.addEventListener('mouseup', highlightHandler);
document.addEventListener('click', undoHighlight);

/**
* Fired when a message is sent from either an extension process or a content script.
*/
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);