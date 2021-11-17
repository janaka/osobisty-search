
export interface highlightMarkupResult { 
  /**
   * The value of @RegExpMatchedHtml wrapped in `<mark id={clipId} class="ob-highlight-952">` tag.
   */
  highlightedHtml: string, 
  /**
   * The regex that was generated to find the text withing the HTML.
   */
  highlightRegExObj: RegExp, 
  /**
   * {true} - if the regex found a match, else {false}
   * The match regex algo only searches withing `<p>` tags so a selection across tags will not match.
   */
  highlightMatchFound: boolean, 
  /**
   * HTML version of the highlight text if the text matched.
   * Check @highlightMatchFound to test.
   * The match regex algo only searches withing `<p>` tags so a selection across tags will not match.
   */
  RegExpMatchedHtml: string | null
}

/**
 * Search a HTML string for a plan text string, that may span inner elements like `<a>`, then if found wrap with a `<mark>` element
 * @param highlightRawText {string} the raw text the was selected by the user on the page from `window.selection()` or similar
 * @param innerHTML {string} the innerHTML of a DOM element like <p> to be 1) searched for the `highlightRawText` 2) then wrapped in `<mark>` element if present.
 * @param id {string} unique Id assigned to the `id` attribute of the `<mark>` element
 * @returns {highlightMarkupResult}. highlighted HTML string. Set the source DOM element innerHTML with this
 */
export function generateHighlightMarkup(highlightRawText: string, innerHTML: string, id?: string): highlightMarkupResult {
  let highlightFound: boolean = false;
  let matchedHtml: string | null = null;
  const matchRegExStep1 = highlightRawText.replace(new RegExp('\\s|\\(|\\)', 'g'), '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?\\$&?(?:<[a-zA-Z0-9"/:=.\\s]*?>)?') // escape regex special char in text
  const matchRegExStep2 = '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?' + matchRegExStep1 + '(?:<\\/[a-zA-Z0-9"/:=.\\s]*?>)?'
  const regExpObj = new RegExp(matchRegExStep2, 'g')
  const match: RegExpMatchArray | null = innerHTML.match(regExpObj)

  if (match != null) {
    highlightFound = true;
    matchedHtml = match[0].toString();
  }
  const idAttribute: string = id ? ' id="' + id + '"' : ""
  const highlightedHtml = innerHTML.replace(regExpObj, '<mark' + idAttribute + ' class="ob-highlight-952">$&</mark>')
  const result: highlightMarkupResult = { highlightedHtml: highlightedHtml, highlightRegExObj: regExpObj, highlightMatchFound: highlightFound, RegExpMatchedHtml: matchedHtml }

  return result
}