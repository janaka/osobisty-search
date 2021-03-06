import { Api, Webclipping, WebClippingResponse, WebClippingsResponse } from './client-libs/osobisty-client'

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  // these logs appear in the extension servie work console, access from the chrome extension page
  console.log("Background script received command=" + request.command + " from content script. traceId=" + request.traceId)
  if (request.command === "getWebClippings") {
    try {
      const api = new Api()

      api.webclippings.getWebclippings({ page_url: request.page_url })
        .then(response => response.json())
        .then((data: WebClippingsResponse) => {
          console.log("get resp ")
          console.log(data.webClippingData)

          if (sender && sender.tab && sender.tab.id) {
            console.log("Send getWebClippings successs response, command=highlightClips, traceId="+request.traceId)
            chrome.tabs.sendMessage(sender.tab.id, { command: "highlightClips", data: data.webClippingData, traceId: request.traceId }, (response) => { })
          } else {

          }
        })
        .catch((error) => {
          console.error("Error: " + error.status + " - " + error.status + ", calling `api.webclippings.getWebclippings()`")
          console.error(error)
          if (sender && sender.tab && sender.tab.id) {
            console.log("Send getWebClippings error response, command=highlightClips, status=" + error.status + ", statusText=" + error.statusText + ", traceId="+request.traceId)
            chrome.tabs.sendMessage(sender.tab.id, { command: "highlightClips", data: "", error: { status: error.status, statusText: error.status}, traceId: request.traceId }, (response) => { })
          }
        })
    } catch (error) {
      throw error
    }
  }

  if (request.command === "saveClipData") {
    try {

      console.log(request.data)
      const api = new Api()

      // make sure all field are mapped here. Else data will get overritten with nothing i.e. data loss
      const wc: Webclipping = {
        clip_id: request.data.clip.id,
        source_content: request.data.clip.source_content,
        notes_content: request.data.clip.notes_content,
        page_url: request.data.page_url,
      }

      api.webclippings.postWebclippings(wc)
        .then(response => response.json())
        .then((data: WebClippingResponse) => {
          console.log("Send saveClipData successs response command=saveClipData, traceId="+request.traceId)
          console.log(data.webClippingData)
          // once saved, tell the content script to highlight the selection
          sendResponse({ msg: data.message, traceId: request.traceId })
        })
        .catch((error) => {

          //chrome.tabs.sendMessage(sender.tab.id, { command: "saveClipDataCmdResponse", msg: "error" }, (response) => { })
          console.error("Error calling `api.webclippings.postWebclippings()`")
          console.error(error)
          console.log("Send saveClipData error response command=saveClipData, status=" + error.status + ", statusText=" + error.statusText + " traceId="+request.traceId)
          sendResponse({ msg: "error status=" + error.status + " , statusText=" + error.statusText, detail: error, traceId: request.traceId})
        })
    } catch (error) {
      throw error
    }
  }


});

const clipSelectionMenuItemHandler = (tab: any) => {
  console.log("Send command=clipSelection, traceId=13000");
  chrome.tabs.sendMessage(tab.id, { command: "clipSelection", traceId: "13000" }, (response) => {
    console.log("Handle command=clipSelection, traceId=13000");
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
          chrome.tabs.sendMessage(tab.id, { command: "highlightSelection", data: data.webClippingData, traceId: response.traceId }, (response) => { })
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

      api.webclippings.getWebclippings({ page_url: response.page_url })
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
    title: 'Osobisty Load Page Highlights',
    type: 'normal',
    contexts: ['page'],
  });
});


chrome.contextMenus.onClicked.addListener(onClickContextMenu)

//when the extension icon is clicked. only fires if there is no ext popup UI hooked up.
chrome.action.onClicked.addListener(
  (tab: any) => {
    //console.log("extention icon clicked!")

    // enable of disable based on the current persisted per origin state in local storage.
    console.log("Send command=toggleSideUI, traceId=13111")
    chrome.tabs.sendMessage(tab.id, { command: "toggleSideUI", data: "", traceId: "13111" }, (response) => { })
    console.log("extention icon clicked!");
    // chrome.scripting.executeScript({
    //   target: {tabId: tab.id},
    //   files: ['content.js']
    // });
  }
);


// chrome.webNavigation.onCompleted.addListener((details)=>{
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     console.log(details)  
//   });

// })

export { }