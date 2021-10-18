
import { DOMMessage, DOMMessageResponse } from '../types';

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
        let highlight: string = sel != null ? sel.toString() : ""
        //TODO: this regex special char are getting in the way. Escape or something to handle
        //highlight = highlight.replace(/[([\]]/g, '\\$&')
        console.log("mouseup event: " + sel?.toString() + " " + highlight)
        let bodyEl: HTMLBodyElement = document.getElementsByTagName<"body">("body")[0]

        const te: Element = topElementWithHighlightText(bodyEl, highlight)

        //const p: number = te.innerHTML.indexOf(highlight)

        console.log("child node count " + te.childNodes.length) // includes text and commnet nodes
        console.log("child count " + te.children.length) // exludes text and commnet nodes
        console.log(te.innerHTML)

        const s = te.innerHTML

        const q: number = te.innerHTML.indexOf(highlight)

        if (q === -1) {
            // finding the highlight text in the innerText but not the innerHTML means
            // the highlight is across a child HTML element
            // so include the child node HTML in the highligh text so it matches in innerHTML

            highlight = spaningHighlightText(bodyEl, highlight)

        }

        const t = highlightWithinChild(bodyEl, highlight)
        if (t === "MARK") { console.log("already highlighted."); return }

        const highlightStartPosition = s.indexOf(highlight)
        const textBefore = s.substr(0, highlightStartPosition)
        const highlightEndPosition = highlightStartPosition + highlight.length
        const textAfter = s.substring(highlightEndPosition, s.length)
        console.log("highlight with html: " + highlight + ", highlightStartPosition=" + highlightStartPosition + ", highlightEndPosition=" + highlightEndPosition)
        bodyEl.innerHTML = textBefore + "<mark>" + highlight + "</mark>" + textAfter
        //pTag.insertAdjacentText("beforeend", textBefore)
        //bodyEl.insertAdjacentHTML("beforeend", "<mark>" + highlight + "</mark>")
        //bodyEl.insertAdjacentHTML("beforeend", textAfter)




    }
}

const undoHighlight = function (event: MouseEvent) {
    //console.log(event.)
}

function topElementWithHighlightText(El: Element, highlight: string): Element {
    let te: Element = new Element()
    for (let k = 0; k < El.children.length; k++) {
        const e: Element = El.children[k];
        console.log("nodename : " + e.nodeName + ", type:" + e.nodeType)
        if (e.nodeName !== "SCRIPT") {
            const p: number = e.innerHTML.indexOf(highlight)
            if (p > -1) {
                console.log("highlight found at pos " + p)
                te = e
            }
        }
    }
    // for (let k = 0; k < El.children.length; k++) {
    //     const e = El.children[k];
    //     console.log("nodename : "+e.nodeName + ", type:" + e.nodeType)
    // }
    return te
}

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


document.addEventListener('mouseup', doHighlight);
document.addEventListener('click', undoHighlight);

/**
* Fired when a message is sent from either an extension process or a content script.
*/
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);