

export const injectSideUI = () => {
  console.log("render side ui")
  try {
    // if not persisted isEnabled state then initialises to false.
    if (getSideUIIsEnabledState()) {
      fetch(chrome.runtime.getURL('/asset-manifest.json')).then(r => r.text()).then(reactAssetManifest => {

        if (!document.getElementById("osobisty-side-ui-root")) {
          // not running in standalone deve mode.
          const reactCsslinkEl = document.createElement("link")
          reactCsslinkEl.href = chrome.runtime.getURL(JSON.parse(reactAssetManifest).files["main.css"])
          reactCsslinkEl.rel = "stylesheet"
          reactCsslinkEl.id = "osobisty-side-ui-css"
          console.log(reactCsslinkEl.href)
          document.head.insertAdjacentElement('afterbegin', reactCsslinkEl) // 'afterbegin': Just inside the element, before its first child.

          const reactScript = document.createElement("script")
          reactScript.src = chrome.runtime.getURL("/static/js/main.js")
          reactScript.id = "osobisty-side-ui-script"
          document.body.insertAdjacentElement('afterbegin', reactScript);

          const reactRootDiv = document.createElement("div")
          reactRootDiv.className = "z-top"
          reactRootDiv.id = "osobisty-side-ui-root"
          document.body.insertAdjacentElement('afterbegin', reactRootDiv); // 'afterbegin': Just inside the element, before its first child
          // not using innerHTML as it would break js event listeners of the page
        }
      });
    }
  } catch (error) {
    throw error
  }
}

export function removeSideUI() {
  document.getElementById("osobisty-side-ui-root")?.remove()
  document.getElementById("osobisty-side-ui-css")?.remove()
  document.getElementById("osobisty-side-ui-script")?.remove()
}

/**
 * toggle between enable and disable based on the currently persisted state.
 * Remembers state per origin
 * return {boolean} enabled=true, disable=false
 */
export function toggleSideUI():boolean {
  let isEnabled: boolean = getSideUIIsEnabledState()

  console.log("toggleSideUI " + isEnabled)


  if (isEnabled) {
    isEnabled = false;
    localStorage.setItem('isEnabled', JSON.stringify({ 'isEnabled': false }));
    removeSideUI()
  } else {
    isEnabled = true
    localStorage.setItem('isEnabled', JSON.stringify({ 'isEnabled': true }));
    injectSideUI()
  }

  return isEnabled;
}


function getSideUIIsEnabledState(): boolean {
  const isEnabledObj = localStorage.getItem('isEnabled');

  if (isEnabledObj === null) {
    localStorage.setItem('isEnabled', JSON.stringify({ 'isEnabled': false }));
    return false
  } else {
    return JSON.parse(isEnabledObj).isEnabled
  };
}
