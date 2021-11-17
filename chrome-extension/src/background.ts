import { Api, Webclipping, WebClippingResponse, WebClippingsResponse } from './client-libs/osobisty-client'


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

const clipSelectionMenuItemHandler = (tab: any) => {

  chrome.tabs.sendMessage(tab.id, { command: "clipSelection" }, (response) => {
    console.log("clipSelection resp: ");
    console.log(response);
    try {
      const api = new Api()

      const wc: Webclipping = {
        source_content: response.selectedText,
        page_url: response.page_url,
      }

      api.webclippings.postWebclippings(wc)
        .then(response => response.json())
        .then((data: WebClippingResponse) => {
          console.log("post resp ")
          console.log(data.webClippingData)
          // once saved, tell the content script to highlight the selection
          chrome.tabs.sendMessage(tab.id, { command: "highlightSelection", data: data.webClippingData }, (response) => { })
        })
        .catch((error) => {
          console.error("Error calling `api.webclippings.postWebclippings()`")
          console.error(error)
        })
    } catch (error) {
      throw error
    }

  });
}

const clipLoadMenuItemHandler = (tab: any) => {
  chrome.tabs.sendMessage(tab.id, { command: "sendClipPageUrl" }, (response) => {
    console.log("clipLoad resp: ");
    console.log(response);
    try {
      const api = new Api()

      api.webclippings.getWebclippings({page_url: response.page_url})
        .then(response => response.json())
        .then((data: WebClippingsResponse) => {
          console.log("get resp ")
          console.log(data.webClippingData)
          // send the data to the content script asking it to highlight on the webpage
          chrome.tabs.sendMessage(tab.id, { command: "highlightClips", data: data.webClippingData }, (response) => { })
        })
        .catch((error) => {
          console.error("Error calling `api.webclippings.getWebclippings()`")
          console.error(error)
        })
    } catch (error) {
      throw error
    }
  });
}

const onClickContextMenu = (onClickData: chrome.contextMenus.OnClickData, tab: any) => {

  switch (onClickData.menuItemId) {
    case "987sfhissdf343534f": {
      // tell content script to get the selected text because only content scripts have access to the page DOM
      clipSelectionMenuItemHandler(tab);
      break;
    }

    case "jhs7292jdj0s32ssk3": {
      clipLoadMenuItemHandler(tab);
      break;
    }
  }
}


chrome.runtime.onInstalled.addListener(function () {

  chrome.contextMenus.create({
    id: '987sfhissdf343534f', // a random string. just needs to be unique
    title: 'Osobisty Clip Selection',
    type: 'normal',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'jhs7292jdj0s32ssk3',
    title: 'Osobisty Load Page Clips',
    type: 'normal',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener(onClickContextMenu)

//chrome.contextMenus.create({"title": "Osobisty Clip Selection", "contexts": ["selection"],"onclick": onClickContextMenu});


export { }