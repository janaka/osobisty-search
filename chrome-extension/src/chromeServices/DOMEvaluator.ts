import { DOMMessage, DOMMessageResponse } from '../types';

document.addEventListener('mouseup',function(event)
{
    
    let sel = window.getSelection()
    //window.alert(sel)
    console.log("mouseup event: " + sel?.toString())

    if (sel != null && sel.toString().length > 0) {
        const highlight:string  = sel != null ? sel.toString() : ""
        let pTags:HTMLCollectionOf<HTMLParagraphElement> = document.getElementsByTagName<"p">("p")

        
        for (let i = 0; i < pTags.length; i++) {
            const pTag:HTMLParagraphElement = pTags[i];
            const t:number = pTag.innerText.search(highlight)
            console.log("highlight found " + t)
            if(t>-1) {
                
                for (let j = 0; j < pTag.children.length; j++) {
                    const child:Element = pTag.children[j];
                    console.log(child.tagName + ": " + child.innerHTML)    
                }
                



                const s = pTag.innerHTML //= pTag.innerText.replace(highlight, "<mark>"+highlight+"</mark>")

                const highlightStartPosition = s.indexOf(highlight)

                const textBefore = s.substr(0, highlightStartPosition)
                const textAfter = s.substring(highlightStartPosition+highlight.length, s.length)
                pTag.innerHTML = textBefore
                //pTag.insertAdjacentText("beforeend", textBefore)
                pTag.insertAdjacentHTML("beforeend","<mark>"+highlight+"</mark>")
                pTag.insertAdjacentText("beforeend", textAfter)
            }
        }
    
    }
    

    // chrome.runtime.sendMessage({highlightedText: sel, greeting: "hello"}, function(response) {
    //     console.log(response.farewell);
    //   });
    // if(sel.length)
    //     chrome.extension.sendRequest({'message':'setText','data': sel},function(response){})
})

console.log("hjg j")

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


/**
* Fired when a message is sent from either an extension process or a content script.
*/
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);