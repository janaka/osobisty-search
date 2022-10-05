import { useEffect, useRef, useState } from "react";
import useKeyboardShortcut from "../hooks/useKeyboardShortcutHook";
import { useQuery } from "../hooks/useQuery";
import LogoutButton from "./logoutButon";

export function Search(props: any) {
  const [resultCount, setResultCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [searchInputBoxValue, setSearchInputBoxValue] = useState("")
  const searchInputBox = useRef<HTMLInputElement>(null);

  const SearchinputKbShortcutHandler = (keys:Object): void => {

    console.log("pressed keys:", keys)

    searchInputBox.current && searchInputBox.current.focus();
  }

  
  useKeyboardShortcut(["Meta", "k"], SearchinputKbShortcutHandler, { overrideSystem: true }) // cmd + k


  const query = useQuery();
  // const q = query.get("q")

  const q = query.get("q")

  // useEffect(() => {
  //   searchInputBox.current && searchInputBox.current.focus();
    
  // });


  useEffect(() => {
    if (props.doReset) {
      console.log("doReset")
      clearSearch()
    }
    return () => {
      // clean up here
    }
    //console.log("Behavior before the component is added to the DOM");
  });

  useEffect(() => {
    if (q) {
      console.log("===" + q)
      setSearchInputBoxValue(q)
      doSearch(props.typesenseClient, q);
    }
  }, []);


  function searchReq() {
    const search = {
      searches: [
        {
          'collection': 'zettleDocuments',
        }
      ]
    }
    return search;
  }

  function commonSearchParams(query: any) {
    console.log(query)
    const searchParams = {
      'q': query,
      'query_by': 'title, tags, note_content, source_content, authors, type',
      'facet_by': 'type, tags',
      'prioritize_exact_match': true,
      'per_page': '20'
    }
    return searchParams;
  }

  function clearSearch() {
    console.log("clearSearch()")
    //history.push("")
    props.results(null)
    setResultCount(0)
    setSearchTime(0)
    setSearchInputBoxValue("")
  }

  async function doSearch(typesenseClient: any, queryInput: string | null | undefined) {

    console.log("doSearch():")
    console.log("query input text: " + queryInput)
    if (queryInput == null || undefined) return
    const response = await typesenseClient.multiSearch.perform(searchReq(), commonSearchParams(queryInput));
    console.log(response);
    if ('error' in response.results[0]) {
      console.error("Typesense backend returned an error", response.results[0])
      return
    }
    props.results(response);
    setResultCount(response.results[0].found)
    setSearchTime(response.results[0].search_time_ms)
    //r.foreach((e:any) => console.log(e));
    // response.results.forEach((result: any) => (
    //   result.hits.forEach((hit: any) => (
    //     console.log(hit)
    //   ))
    // ));

    return response;
  }

  return (
    <div>
      <div className="search-box">
        <input ref={searchInputBox}
          value={searchInputBoxValue}
          placeholder={props.placeholderText}
          autoFocus={props.autoFocus}
          className="search-box-input"
          onChange={async (e) => {
            const r: any = null;
            try {
              if (e.target.value && e.target.value.length > 0) {
                setSearchInputBoxValue(e.target.value)
                await doSearch(props.typesenseClient, searchInputBoxValue);
              } else {
                // reset when input box is cleared
                console.log("input onChange() clear")
                clearSearch()
              }
            } catch (e) {
              console.error(e)
            }
          }}
          onKeyDown={
            (e) => {
              e.key == "Escape" ? clearSearch() : null
            }
          }
        />
        <button title="Clear search" className="search-box-clear"
          onClick={async (e) => {
            clearSearch()
          }}
        >
          ×
        </button>
        <LogoutButton />
      </div>
      <div className="sidebar-stats">
        <div className="sidebar-results-stats">
          {resultCount} results ({searchTime}ms)
        </div>
      </div>
      <div>

        {props.children}
      </div>
    </div>
  );
}