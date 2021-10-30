import { Api, Webclipping, WebClippingResponse } from './client-libs/osobisty-client'


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.messageName === "postWebClipping") {
    console.log("Message received in background script")
    console.log("highlight: " + request.messageData)

    const api = new Api()

    const wc: Webclipping = {
      source_content: request.messageData,
      link: 'http://www.url.com'
    }

    api.webclippings.postWebclippings(wc)
      .then(response => response.json())
      .then((data: WebClippingResponse) => {
        console.log(data.webClippingData)
        sendResponse(data)
      })
      .catch((error) => { console.error(error) })
  }

});

const onClickContextMenu = (onClickData: chrome.contextMenus.OnClickData, tab: any) => {
  if (onClickData.menuItemId === "987sfhissdf343534f") {
    // tell content script to get the selescted text. Only content scripts have access to the page DOM
    chrome.tabs.sendMessage(tab.id, { command: "clipSelection" }, function (response) {
      console.log(response);
      const api = new Api()

      const wc: Webclipping = {
        source_content: response.selectedText,
        link: response.link
      }

      api.webclippings.postWebclippings(wc)
        .then(response => response.json())
        .then((data: WebClippingResponse) => {
          console.log(data.webClippingData)
          chrome.tabs.sendMessage(tab.id, { command: "highlightSelection" }, function (response) {})
        })
        .catch((error) => { console.error(error) })
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