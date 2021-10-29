import { Api, Webclipping } from './client-libs/osobisty-client'

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {    
  if (request.messageName === "postWebClipping") {
    console.log("Message received in background script")
    console.log("highlight: " + request.messageData)

      const api = new Api()

      const wc: Webclipping = {
          source_content: "sdfsdfsfsadjhjkhsdfkh kjhsd fkhds f",
          link: 'http://www.url.com'
      }
      const res = await api.webclippings.postWebclippings(wc)

      if (res.error) {
          console.error("save failed", res.error)

      } else if (res.ok && res.data.webClippingData!==null) {
          console.log(res.data.webClippingData)
      }

  }

});

export {}