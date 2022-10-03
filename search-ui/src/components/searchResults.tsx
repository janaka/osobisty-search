import { addHightlightMarkup } from "../utils/addHighlightMarkup"

export function SearchResults(props: any) {
  // const [selectedRowUI, setSelectedRowUI] = useState("");

  // const moveFocus = (key: any): void => {

  //   const active = document.activeElement;
  //   if (active!==null) {
  //     if (key === 40 && active.nextSibling) {
  //       active.nextSibling;
  //     }
  //     if (key === 38 && active.previousSibling) {
  //       active.previousSibling.focus();
  //     }
  //   }

  // }

  //useKeyboardShortcut([String.fromCharCode(40), String.fromCharCode(38)], moveFocus, { overrideSystem: false })

  return (
    <div className="search-results">
      {props.data && props.data.results.length > 0 && props.data.results[0].hits.length > 0
        ?
        <ol className="search-results-list">
          {
            props.data.results.map((result: any) => (
              result.hits.map((hit: any) => (
                <li
                  className={(props.selectedHit && props.selectedHit.document.id == hit.document.id) ? "search-result selected" : "search-result"}
                  key={hit.document.id}
                  onClick={() => (
                    props.setSelectedHit(hit)
                  )
                  }
                >
                  {hit.document.type
                    ? <span className="search-result-module" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "type") }}></span>
                    : <span className="search-result-module">none</span>
                  }
                  {hit.document.title && <span className="search-result-title" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "title") }}></span>}
                  <span className="search-result-content" dangerouslySetInnerHTML={{ __html: addHightlightMarkup(hit, "note_content") }}></span>
                </li>
              ))
            ))
          }
        </ol>
        :
        <div><Suggestions setSelectedHitFunc={props.setSelectedHit}/></div>

      }
    </div >
  )
}

function Suggestions(props:any) {
  return (
    <div className="search-results search-results-empty">
      <h2 className="empty-state-heading">Suggestions</h2>
      <div className="search-results-suggestions">
        <button className="search-results-suggestion">PaaS</button>
        <button className="search-results-suggestion" onClick={()=>props.setSelectedHitFunc({document: {authors: '', date: '', id: 'simpletestmd', collectionName: 'zettlekasten__root'}}) }>Simple Test.md</button>
        <button className="search-results-suggestion" onClick={()=>props.setSelectedHitFunc({document: {authors: '', date: '', id: 'complextestmd', collectionName: 'zettlekasten__root'}}) }>Complex Test.md</button>
        <button className="search-results-suggestion" onClick={()=>props.setSelectedHitFunc({document: {authors: '', date: '', id: 'inboxmd', collectionName: 'zettlekasten__root'}}) }>Inbox</button>
      </div>
      <h2 className="empty-state-heading">Key bindings</h2><div className="keyboard-map">
        <ul className="keyboard-map-list"><li className="keyboard-map-item"><div className="keybinding-keys">
          <kbd className="">Tab</kbd></div><div className="keybinding-detail">Next search result</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Shift</kbd>
            <kbd className="">Tab</kbd></div><div className="keybinding-detail">Previous search result</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Enter</kbd></div>
            <div className="keybinding-detail">Show preview pane</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">Escape</kbd></div><
            div className="keybinding-detail">Hide preview pane, clear search</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">/</kbd></div>
            <div className="keybinding-detail">Focus search box</div></li>
          <li className="keyboard-map-item"><div className="keybinding-keys"><kbd className="">`</kbd></div>
            <div className="keybinding-detail">Switch light/dark color theme</div></li></ul></div>

      <h2 className="empty-state-heading">About Osobisty</h2>
      <div className="about">
        <p className="">
          Osobisty means <em>private</em> in Polish.</p>
        <p>
          Osobisty is a Zettlekasten/2nd brain with fast universal search by <a href="https://janaka.dev" target="_blank" className="" rel="noreferrer">Janaka</a>.
          It&apos;s heavily influenced by <a href="https://thesephist.com/" target="_blank" rel="noreferrer">Linus Lee&apos;s</a>&nbsp;
          <a href="https://github.com/thesephist/monocle" target="_blank" rel="noreferrer">Monolce</a> project, the UI design is a clone.
          It&apos;s built with React (UI), NodeJS (crawlers + indexers), Typescript, and <a href="https://typesense.org">Typesene</a> for the full-text index and search engine in the backend.
          Osobisty searches across Janaka&apos;s content; Zettlekasten, Blogs, Twitter boommarks, Chrome bookmarks, and Kindle highlights.
        </p>
        <p>Read more about why I built Osobisty <a href="https://janaka.dev/introducing-osobisty-universal-personal-search-engine/" target="_blank" rel="noreferrer">here</a>.</p>
      </div>
    </div>
  )
}
