import { ClipHighlight } from './ClipHighlight';

const html1: string = 'The penny dropped when I heard Linus Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his <a href="https://thesephist.com/posts/monocle/">Monocle project</a> on the <a href="https://changelog.com/podcast/455">The Changelog E455 - Building Software for Yourself</a>. The problem(s) he’s trying to solve resonated. <a href="https://github.com/amirgamil/apollo">Apollo</a> is another personal search engine, inspired by Monocle, which I also looked at.';
const html2: string = 'Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his';
const htmlWithNewLine: string = 'UI - ReactJS + TypeScript.' + String.fromCharCode(10)
+ 'Crawlers and indexers - NodeJS + TypeScript' + String.fromCharCode(10)
+ 'Search engine - <a href="https://typesense.org/">Typesense</a> a fast OSS search engine that’s really easy to work with. I started out considering DuckDB which I’d come across recently (I think on <a href="https://changelog.com/podcast/454">Changelog E454</a>) which supported text indexing. And Lucene was probably one of my backup options. But then I discovered Typesene. I also looked at <a href="https://www.meilisearch.com/">Meilisearch</a> but Typesense seemed to be better all-round. I didn’t do a deep analysis, just on paper assessment.';
const htmldoc: string = '<html><head></head><body><p>' + html1 + '</p><p>' + html2 + '</p><p>' + htmlWithNewLine + '</p></body></html>'
const parser = new DOMParser();
const dom = parser.parseFromString(htmldoc, "text/html")

const htmlElementCollection1: HTMLCollectionOf<HTMLParagraphElement> = dom.getElementsByTagName<"p">("p")

function htmlCollectionOfOneParaFactory(innerHtml: string): HTMLCollectionOf<HTMLParagraphElement> {
  const htmldoc: string = '<html><head></head><body><p>' + innerHtml + '</p></body></html>'
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmldoc, "text/html")

  const htmlElementCollection1: HTMLCollectionOf<HTMLParagraphElement> = dom.getElementsByTagName<"p">("p")
  return htmlElementCollection1;
}
describe('Test ClipHighlight class - HTML match scenarios', () => {
  test('match just element wrapped text', () => {
    const highlightRawText: string = 'The Sephist';
    const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
    expect(clipHighlight.RegExpMatchedHtml).toBe('<a href="https://twitter.com/thesephist">The Sephist</a>')
  });

  test('match start with element end with text', () => {
    const highlightRawText: string = 'Apollo is another personal search';
    //const highlightedObj = generateHighlightMarkup(highlightRawText, html1)
    const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
    //console.log(clipHighlight.highlightRegExObj)
    expect(clipHighlight.RegExpMatchedHtml).toBe('<a href="https://github.com/amirgamil/apollo">Apollo</a> is another personal search')

  });


  test('match element immediately followed by closing bracket', () => {

    const highlightRawText: string = '(aka The Sephist) talk';
    const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
    expect(clipHighlight.RegExpMatchedHtml).toBe('(aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk')
  });


  test('match open bracket immediately followed by element', () => {
    const html = htmlCollectionOfOneParaFactory('Lee (<a href="https://twitter.com/thesephist">The Sephist</a>) talk about his');
    const highlightRawText: string = '(The Sephist) talk';
    const clipHighlight = new ClipHighlight(highlightRawText, html)
    expect(clipHighlight.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>) talk')
  });

  test('match element just wrapped in brackets', () => {
    const html = htmlCollectionOfOneParaFactory('(<a href="https://twitter.com/thesephist">The Sephist</a>)');
    const highlightRawText: string = '(The Sephist)';
    const clipHighlight = new ClipHighlight(highlightRawText, html)
    expect(clipHighlight.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>)')
  });

  test('match mid element highlight', () => {
    const html = htmlCollectionOfOneParaFactory('Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>)');
    const highlightRawText: string = 'Lee (aka The';
    const clipHighlight = new ClipHighlight(highlightRawText, html)
    expect(clipHighlight.RegExpMatchedHtml).toBe('Lee (aka <a href="https://twitter.com/thesephist">The')
  });

  test('Match text with RegEx special charaters. Test escaping scenario 1', () => {
    const html = htmlCollectionOfOneParaFactory('UI - $100 ReactJS + TypeScript. Crawlers, {hello} and [indexers] - NodeJS* what? this[^1] + TypeScript Search engine');
    const highlightRawText: string = 'UI - $100 ReactJS + TypeScript. Crawlers, {hello} and [indexers] - NodeJS* what? this[^1]';
    const clipHighlight = new ClipHighlight(highlightRawText, html)
    expect(clipHighlight.RegExpMatchedHtml).toBe('UI - $100 ReactJS + TypeScript. Crawlers, {hello} and [indexers] - NodeJS* what? this[^1]')
    expect(clipHighlight.highlightMatchFound).toBe(true)
  });

  test('Match text with RegEx special charaters. Test escaping scenario 2', () => {
    const html = htmlCollectionOfOneParaFactory('UI - ReactJS + TypeScript. Crawlers and indexers - NodeJS + TypeScript Search engine - ');
    const highlightRawText: string = 'UI - ReactJS + TypeScript. Crawlers and indexers - NodeJS + TypeScript Search';
    const clipHighlight = new ClipHighlight(highlightRawText, html)
    expect(clipHighlight.RegExpMatchedHtml).toBe('UI - ReactJS + TypeScript. Crawlers and indexers - NodeJS + TypeScript Search')
    expect(clipHighlight.highlightMatchFound).toBe(true)
  });

  test('Match text with RegEx special characters and New Lines', () => {
    
    const highlightRawText: string = 'UI - ReactJS + TypeScript. Crawlers and indexers - NodeJS + TypeScript Search';
    const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
    expect(clipHighlight.RegExpMatchedHtml).toBe('UI - ReactJS + TypeScript. Crawlers and indexers - NodeJS + TypeScript Search')
    expect(clipHighlight.highlightMatchFound).toBe(true)
  });

  test('Match text with RegEx special characters and New Lines - using local regex test function', () => {
    // use the local funcition to make debugging issues faster.
    const html = 'UI - ReactJS + TypeScript.'+String.fromCharCode(10)+'Crawlers and indexers - NodeJS + TypeScript Search engine - <a href="https://typesense.org/">Typesense</a> a fast OSS search engine that’s really easy to work with. I started out considering DuckDB which I’d come across recently (I think on <a href="https://changelog.com/podcast/454">Changelog E454</a>) which supported text indexing. And Lucene was probably one of my backup options. But then I discovered Typesene. I also looked at <a href="https://www.meilisearch.com/">Meilisearch</a> but Typesense seemed to be better all-round. I didn’t do a deep analysis, just on paper assessment.';
    const highlightRawText: string = 'UI - ReactJS + TypeScript.'+String.fromCharCode(10)+'Crawlers and indexers - NodeJS + TypeScript Search';
    //const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1, undefined, true)
    const regexobj = generateRegExp(highlightRawText)
    const match = html.match(regexobj)
    expect(match).not.toBeNull()
    const matchStr = match ? match[0].toString() : ""
    
    expect(matchStr).toBe('UI - ReactJS + TypeScript.'+String.fromCharCode(10)+'Crawlers and indexers - NodeJS + TypeScript Search')
    
  });

  test('regex', () => {
    const html = 'UI - ReactJS + TypeScript.'+String.fromCharCode(10)+'Crawlers and indexers - NodeJS + TypeScript Search engine';
    const matchRegExStep1 = html.replace(new RegExp('\\n', 'g'), '\n') // escape NewLine characters
    expect(matchRegExStep1).toBe('UI - ReactJS + TypeScript.\nCrawlers and indexers - NodeJS + TypeScript Search engine')
 //expect(clipHighlight.highlightMatchFound).toBe(true)
  });
  
});

function generateRegExp(clipText: string): RegExp {
  let matchRegExStepFinal = "";
  try {
    
    const escCharRegEx = new RegExp('\\s|\\(|\\)|\\+|\\[|\\*|\\?|\\^|\\$', 'g') // list of special characters to escape
    const matchRegExStepLast = clipText.replace(escCharRegEx, '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?\\$&?(?:<[a-zA-Z0-9"/:=.\\s]*?>)?'); // escape regex special char in text
    //const matchRegExStepLast = matchRegExStep1.replace(new RegExp('\\n', 'g'), '\\s') // escape NewLine characters
    //this.highlightTextEscaped = matchRegExStepLast;
    matchRegExStepFinal = '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?' + matchRegExStepLast + '(?:<\\/[a-zA-Z0-9"/:=.\\s]*?>)?';
    const regExpObj = new RegExp(matchRegExStepFinal, 'g');  
    return regExpObj;
  } catch (error) {
    console.error('clipText: "'+ clipText + '"')
    console.error('matchRegExStepFinal="' +matchRegExStepFinal+'"')
    throw error
  }
}


export { }