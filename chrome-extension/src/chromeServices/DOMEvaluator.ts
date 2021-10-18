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
        let pTags: HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")

        console.log("selection object: " +sel.focusNode )

        //TODO: try getting the context node from the selection object

        for (let i = 0; i < pTags.length; i++) {
            const pTag: HTMLParagraphElement = pTags[i];
            const p: number = pTag.innerText.indexOf(highlight)
            console.log("highlight found at pos " + p)
            if (p > -1) {
                console.log("child node count " + pTag.childNodes.length) // includes text and commnet nodes
                console.log("child count " + pTag.children.length) // exludes text and commnet nodes
                console.log(pTag.innerHTML)

                const s = pTag.innerHTML 

                const q: number = pTag.innerHTML.indexOf(highlight)

                if (q === -1) {
                    // finding the highlight text in the innerText but not the innerHTML means
                    // the highlight is across a child HTML element
                    // so include the child node HTML in the highligh text so it matches in innerHTML

                    for (let j = 0; j < pTag.children.length; j++) {
                        const child: Element = pTag.children[j];
                        console.log(child.nodeName)
                        if (child.nodeName === "MARK") {
                            console.log("already highlighted. remove and rehighlight")
                            return
                        }
                        const t = highlight.indexOf(child.innerHTML)
                        if (t > -1) { // crosses this element

                            const highlighttextBeforeNode = highlight.substr(0, t)
                            const highlighttextAfterNode = highlight.substring(t + child.innerHTML.length, highlight.length)
                            highlight = highlighttextBeforeNode + child.outerHTML + highlighttextAfterNode
                        }
                    }

                }

                const t = highlightWithinChild(pTag, highlight)
                if (t === "MARK") { console.log("already highlighted."); return }

                const highlightStartPosition = s.indexOf(highlight)
                const textBefore = s.substr(0, highlightStartPosition)
                const highlightEndPosition = highlightStartPosition + highlight.length
                const textAfter = s.substring(highlightEndPosition, s.length)
                console.log("highlight with html: " + highlight + ", highlightStartPosition=" + highlightStartPosition + ", highlightEndPosition=" + highlightEndPosition)
                pTag.innerHTML = textBefore
                //pTag.insertAdjacentText("beforeend", textBefore)
                pTag.insertAdjacentHTML("beforeend", "<mark>" + highlight + "</mark>")
                pTag.insertAdjacentHTML("beforeend", textAfter)


            }
        }

    }
}

const undoHighlight = function(event:MouseEvent) {
    //console.log(event.)
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