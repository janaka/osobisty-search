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

  /**
   * The clip text with special regex characters escaped 
   */
  highlightTextEscaped: string;

  /**
   * Unique ID for this clip. If present set at the `id` attribute of the `<mark>` element for this highlight available in {@link highlightedHtml}
   */
  clipId: string | undefined;

  /**
   * When {true} extra debub information is output to the console.
   * Default = {false}
   */
  debugModeOn: boolean;

  constructor(higlightClipText: string, htmlElementCollect: HTMLCollectionOf<HTMLParagraphElement>,  clipId?: string, debugModeOn:boolean=false) {
    this.clipText = higlightClipText;
    this.RegExpMatchedHtmlElement = null;
    this.RegExpMatchedHtml = "";
    this.highlightMatchFound = false;
    this._highlightedHtml = "";
    this.highlightTextEscaped = "";
    this.highlightRegExObj = this.generateRegExp(this.clipText);
    this.clipId = clipId ? clipId : undefined;
    this.debugModeOn = debugModeOn;

    for (let i = 0; i < htmlElementCollect.length; i++) {
      const pEl = htmlElementCollect[i];
      pEl.innerHTML = pEl.innerHTML.replace(new RegExp('\\n|\\t|\\v|\\f|\\r|\\0', 'g'), ' ') // strip any New Line etc. from innerHTML
      if (this.debugModeOn) {
        console.log("ElementInnerHtml>>>" + pEl.innerHTML) //.replace(new RegExp('\\t|\\n|\\v|\\f|\\0|\\r', 'g'), ' '))
        console.log("EscapedClipText>>>" + this.highlightTextEscaped)
      }
      
      const match: RegExpMatchArray | null = pEl.innerHTML.match(this.highlightRegExObj);
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
    if (this.highlightMatchFound && this.RegExpMatchedHtmlElement && this.highlightedHtml) {
      this.RegExpMatchedHtmlElement.innerHTML = this.highlightedHtml
    } else {
      throw new Error("ClipHighlight.applyHighlight() - cannot apply highlight because no match was found or RegExpMatchedHtmlElement is null or highlightedHtml is null")
    }

  }

  /**
   * 
   * @param clipText {string} plain clip text with no html 
   * @returns {RegExp} regular expression that would match the {@link clipText} in HTML
   */
  private generateRegExp(clipText: string): RegExp {
    let matchRegExStepFinal = "";
    try {
      
      const escCharRegEx = new RegExp('\\s|\\(|\\)|\\+|\\[|\\*|\\?|\\^|\\$', 'g') // list of special characters to escape
      const matchRegExStepLast = clipText.replace(escCharRegEx, '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?\\$&?(?:<[a-zA-Z0-9"/:=.\\s]*?>)?'); // escape regex special char in text
      //const matchRegExStepLast = matchRegExStep1.replace(new RegExp('\\n', 'g'), '\\s') // escape NewLine characters
      this.highlightTextEscaped = matchRegExStepLast;
      matchRegExStepFinal = '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?' + matchRegExStepLast + '(?:<\\/[a-zA-Z0-9"/:=.\\s]*?>)?';
      const regExpObj = new RegExp(matchRegExStepFinal, 'g');  
      return regExpObj;
    } catch (error) {
      console.error('clipText: "'+ clipText + '"')
      console.error('matchRegExStepFinal="' +matchRegExStepFinal+'"')
      throw error
    }
  }
}

export { }