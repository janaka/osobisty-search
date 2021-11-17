import { ClipHighlight } from './ClipHighlight';

const html1:string = 'The penny dropped when I heard Linus Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his <a href="https://thesephist.com/posts/monocle/">Monocle project</a> on the <a href="https://changelog.com/podcast/455">The Changelog E455 - Building Software for Yourself</a>. The problem(s) he’s trying to solve resonated. <a href="https://github.com/amirgamil/apollo">Apollo</a> is another personal search engine, inspired by Monocle, which I also looked at.';
const html2:string = 'Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his';
const htmldoc: string = '<html><head></head><body><p>'+ html1 + '</p><p>' + html2 + '</p></body></html>'
const parser = new DOMParser();
const dom = parser.parseFromString(htmldoc, "text/html")

const htmlElementCollection1: HTMLCollectionOf<HTMLParagraphElement> = dom.getElementsByTagName<"p">("p")

function htmlCollectionOfOneParaFactory(innerHtml:string): HTMLCollectionOf<HTMLParagraphElement> {
  const htmldoc: string = '<html><head></head><body><p>'+ innerHtml + '</p></body></html>'
  const parser = new DOMParser();
  const dom = parser.parseFromString(htmldoc, "text/html")
  
  const htmlElementCollection1: HTMLCollectionOf<HTMLParagraphElement> = dom.getElementsByTagName<"p">("p")
  return htmlElementCollection1;
}

test('match just element wrapped text', () => {
  const highlightRawText:string = 'The Sephist';
  const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
  expect(clipHighlight.RegExpMatchedHtml).toBe('<a href="https://twitter.com/thesephist">The Sephist</a>')
});

test('match start with element end with text', () => {
  const highlightRawText:string = 'Apollo is another personal search';
  //const highlightedObj = generateHighlightMarkup(highlightRawText, html1)
  const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
  //console.log(clipHighlight.highlightRegExObj)
  expect(clipHighlight.RegExpMatchedHtml).toBe('<a href="https://github.com/amirgamil/apollo">Apollo</a> is another personal search')
  
});


test('match element immediately followed by closing bracket', () => {
  
  const highlightRawText:string = '(aka The Sephist) talk';
  const clipHighlight = new ClipHighlight(highlightRawText, htmlElementCollection1)
  expect(clipHighlight.RegExpMatchedHtml).toBe('(aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk')
});


test('match open bracket immediately followed by element', () => {
  const html = htmlCollectionOfOneParaFactory('Lee (<a href="https://twitter.com/thesephist">The Sephist</a>) talk about his');
  const highlightRawText:string = '(The Sephist) talk';
  const clipHighlight = new ClipHighlight(highlightRawText, html)
  expect(clipHighlight.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>) talk')
});

test('match element just wrapped in brackets', () => {
  const html = htmlCollectionOfOneParaFactory('(<a href="https://twitter.com/thesephist">The Sephist</a>)');
  const highlightRawText:string = '(The Sephist)';
  const clipHighlight = new ClipHighlight(highlightRawText, html)
  expect(clipHighlight.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>)')
});

test('match mid element highlight', () => {
  const html = htmlCollectionOfOneParaFactory('Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>)');
  const highlightRawText:string = 'Lee (aka The';
  const clipHighlight = new ClipHighlight(highlightRawText, html)
  expect(clipHighlight.RegExpMatchedHtml).toBe('Lee (aka <a href="https://twitter.com/thesephist">The')
});



export {}