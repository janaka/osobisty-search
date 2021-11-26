/**
 * This script is injected into the page from the content script.
 * Event handlers need to be attached here, not from the content script
 */


const mouseoverHandler = (event:any) => {
  event.target.style.color = "red"
  console.log("fire handler")
}

const mouseoutHandler = (event:any) => {
  event.target.style.color = ""
  console.log("fire handler")
}

const highlights = document.getElementsByClassName("ob-highlight-952")

for (let i = 0; i < highlights.length; i++) {
  const el = highlights[i];
  el.addEventListener('mouseover',mouseoverHandler, false)
  el.addEventListener('mouseout',mouseoutHandler, false)
}

export {}