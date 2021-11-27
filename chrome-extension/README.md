# Chorme Extension for Osobisity and Zettle

This is companion to the Osobisty personal search engine.

## Dev

### Install Extension

Only need to do this once on each dev machine.

- `yarn build`
- Go to [](chrome://extensions/)
- click `Load unpacked` point at the build folder

### SideUI Dev Loop

- `yarn build`
- `yarn start`
- Browse to [http://localhost:3000/](http://localhost:3000/)
  - Should hot reload on each save of React files.

### Extension Dev Loop

Hot reload (Fast Refresh) doesn't work for the background script and content script at this point. They are technically separate entry points. Webpack is generating the bundles for now.

- `yarn build`
- Go to [](chrome://extensions/) and hit reload icon
- Then reload the page for content script changes

### Architecture

- In dev test mode when browsing localhost:3000 the SideUI is hosted in `index.html` like a standard CRA app. 
- There's no extention `popup` UI for now because multi entry point CRA is a massive pain
- The Chrome Extension scripts
  - content script: `src/chromeservices/highlightContentScript.ts`
  - background script: `src/backgroud.ts`
    - API call are handled here therefore no cors issues.
    - The content script, SideUI (and extension popup if needed) send commands to the background script using message passing.
    - The SideUI uses the standard window.onMessage API. Extension scripts use a chrome messaging API.
- `src/pageLogic.ts` bind eventhandlers to elements on the host page for inline functionality like the `<mark>` elements used to highlight clips on the host page.
- TODO: add architecture diagram