/**
 * A clip of text highlighted on a HTML web page
 */
export class ClipHighlight {
private _highlightedHtml: string | null;

  /**
   * The clip text that was passed into the constructor.
   */
  readonly clipText: string;

  readonly RegExpMatchedHtmlElement: HTMLParagraphElement | null;

 /**
 * The value of {@link RegExpMatchedHtml} wrapped in `<mark id={clipId} class="ob-highlight-952">` tag.
 * If {@link clipId} is empty then the `id` attribute is not rendered.
 * The {@link clipId} property can be set after construction and calling this property will rerender with the `id` attribute
 */
  get highlightedHtml(): string | null {
    const idAttribute: string = this.clipId ? ' id="' + this.clipId + '"' : "";
    if (this.RegExpMatchedHtmlElement && this.highlightRegExObj) {
      this._highlightedHtml = this.RegExpMatchedHtmlElement.innerHTML.replace(this.highlightRegExObj, '<mark' + idAttribute + ' class="ob-highlight-952">$&</mark>');
    }
    return this._highlightedHtml
  }
  
  /**
   * The regex that was generated to find the text withing the HTML.
   */
  highlightRegExObj: RegExp | null;
  
  /**
   * {true} - if the regex found a match, else {false}
   * The match regex algo only searches withing `<p>` tags so a selection across tags will not match.
   */
  highlightMatchFound: boolean;

  /**
   * HTML version of the highlight text if the text matched.
   * Check @highlightMatchFound to test.
   * The match regex algo only searches withing `<p>` tags so a selection across tags will not match.
   */
  RegExpMatchedHtml: string | null;

  highlightTextEscaped: string;

  /**
   * Unique ID for this clip. If present set at the `id` attribute of the `<mark>` element for this highlight available in {@link highlightedHtml}
   */
  clipId: string | undefined;

  constructor(higlightClipText: string, htmlElementCollect: HTMLCollectionOf<HTMLParagraphElement>, clipId?: string) {
    this.clipText = higlightClipText;
    this.RegExpMatchedHtmlElement = null;
    this.RegExpMatchedHtml = "";
    this.highlightMatchFound = false;
    this._highlightedHtml = "";
    this.highlightTextEscaped = "";
    this.highlightRegExObj = this.generateRegExp(this.clipText);
    this.clipId = clipId ? clipId : undefined;

    for (let i = 0; i < htmlElementCollect.length; i++) {
      const pEl = htmlElementCollect[i];

      const match: RegExpMatchArray | null = pEl.innerHTML.match(this.highlightRegExObj);
      //console.log(pEl.innerHTML)
      if (match != null) {        
        this.highlightMatchFound = true;
        this.RegExpMatchedHtmlElement = pEl;
        this.RegExpMatchedHtml = match[0].toString();        
        break;
      }
    }

  }

  /**
   * Call this method to apply the highlight on the source HTML page.
   * Replaces the innerHTML property of the respective element with the value of {@link ClipHighlight.highlightedHtml}
   */
  applyHighlight() {

  }

  /**
   * 
   * @param clipText {string} plain clip text with no html 
   * @returns {RegExp} regular expression that would match the {@link clipText} in HTML
   */
  private generateRegExp(clipText: string): RegExp {
    const matchRegExStep1 = clipText.replace(new RegExp('\\s|\\(|\\)', 'g'), '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?\\$&?(?:<[a-zA-Z0-9"/:=.\\s]*?>)?'); // escape regex special char in text
    this.highlightTextEscaped = matchRegExStep1;
    const matchRegExStep2 = '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?' + matchRegExStep1 + '(?:<\\/[a-zA-Z0-9"/:=.\\s]*?>)?';
    const regExpObj = new RegExp(matchRegExStep2, 'g');
    return regExpObj;
  }
}

export { }