import { Api, Webclipping, WebClippingResponse } from './client-libs/osobisty-client'


// chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
//   if (request.messageName === "postWebClipping") {
//     console.log("Message received in background script")
//     console.log("highlight: " + request.messageData)

//     const api = new Api()

//     const wc: Webclipping = {
//       source_content: request.messageData,
//       page_url: 'http://www.url.com'
//     }

//     api.webclippings.postWebclippings(wc)
//       .then(response => response.json())
//       .then((data: WebClippingResponse) => {
//         console.log(data.webClippingData)
//         sendResponse(data)
//       })
//       .catch((error) => { console.error(error) })
//   }

// });

const onClickContextMenu = (onClickData: chrome.contextMenus.OnClickData, tab: any) => {
  if (onClickData.menuItemId === "987sfhissdf343534f") {
    // tell content script to get the selected text because only content scripts have access to the page DOM
    chrome.tabs.sendMessage(tab.id, { command: "clipSelection" }, function (response) {
      console.log("clipSelection resp: ");
      console.log(response);
      const api = new Api()

      const wc: Webclipping = {
        source_content: response.selectedText,
        page_url: response.link,
      }

      api.webclippings.postWebclippings(wc)
        .then(response => response.json())
        .then((data: WebClippingResponse) => {
          console.log("post resp ")
          console.log(data.webClippingData)
          // once saved, tell the content script to highlight the selection
          chrome.tabs.sendMessage(tab.id, { command: "highlightSelection", data: data.webClippingData}, (response) => {})
        })
        .catch((error) => { 
          console.error("Error calling `api.webclippings.postWebclippings()`")
          console.error(error) 
        })
    });
  }
}


chrome.runtime.onInstalled.addListener(function () {

  chrome.contextMenus.create({
    id: '987sfhissdf343534f',
    title: 'Osobisty Clip Selection',
    type: 'normal',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(onClickContextMenu)

//chrome.contextMenus.create({"title": "Osobisty Clip Selection", "contexts": ["selection"],"onclick": onClickContextMenu});


export { }