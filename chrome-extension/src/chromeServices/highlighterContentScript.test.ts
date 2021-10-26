


test('match: <b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)', () => {
  const highlightText:string = 'aka The Sephist the'
  const searchRegex = '(?:<.*?>)?'+highlightText.replaceAll(" ", '\\s?(?:<.*?>)?\\s?')+'(?:<\\/.*?>)?'
  const html:string = '(<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)'
  expect(searchRegex).toBe('(?:<.*?>)?aka\\s?(?:<.*?>)?\\s?The\\s?(?:<.*?>)?\\s?Sephist\\s?(?:<.*?>)?\\s?the(?:<\\/.*?>)?')
  //console.log(searchRegex)
  const regExpObj = new RegExp(searchRegex, 'g')
  //console.log(regExpObj)
  const match = html.match(regExpObj)
  expect(match).not.toBeNull()
  
  expect(match[0]).toBe('<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the');

  const highlightedHtml = html.replace(regExpObj, '<mark>$&</mark>')
  //console.log(highlightedHtml)
  expect(highlightedHtml).toBe('(<mark><b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the</mark>)')
});

test('match: aka <a href="https://twitter.com/thesephist">The Sephist</a>the', () => {
  const html:string = '(aka <a href="https://twitter.com/thesephist">The Sephist</a>the)'
  const match = html.match('aka\s?<?.*?>?\s??The\s?<?.*?>?\s??Sephist\s?<?.*?>\s??the')
  expect(match[0]).toBe('aka <a href="https://twitter.com/thesephist">The Sephist</a>the');
});

test('match: aka <a href="https://twitter.com/thesephist">The Sephist</a>', () => {
  const html:string = '(aka <a href="https://twitter.com/thesephist">The Sephist</a>the)'
  const match = html.match('aka\s?<?.*?>?\s??The\s?<?.*?>?\s??Sephist\s?<?.*?>\s??')
  expect(match[0]).toBe('aka <a href="https://twitter.com/thesephist">The Sephist</a>');
});

test('match start of para:', () => {
  const html:string = '<p>The penny dropped when I heard Linus Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his <a href="https://thesephist.com/posts/monocle/">Monocle project</a> on the <a href="https://changelog.com/podcast/455">The Changelog E455 - Building Software for Yourself</a>. The problem(s) he’s trying to solve resonated. <a href="https://github.com/amirgamil/apollo">Apollo</a> is another personal search engine, inspired by Monocle, which I also looked at.</p>'
  const match = html.match('(?:<.*?>)?The\\s?(?:<.*?>)?\\s?penny(?:<\\/.*?>)?')
  expect(match[0]).toBe('The penny');
});



export {}