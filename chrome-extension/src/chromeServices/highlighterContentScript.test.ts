test('match: <b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)', () => {
  const highlightText:string = 'aka The Sephist the'
  const searchRegex = '(?:<.*?>)?'+highlightText.replaceAll(" ", '\\s?(?:<.*?>)?\\s?')+'(?:<\\/.*?>)?'
  const html:string = '(<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)'
  expect(searchRegex).toBe('(?:<.*?>)?aka\\s?(?:<.*?>)?\\s?The\\s?(?:<.*?>)?\\s?Sephist\\s?(?:<.*?>)?\\s?the(?:<\\/.*?>)?')
  console.log(searchRegex)
  const regExpObj = new RegExp(searchRegex, 'g')
  console.log(regExpObj)
  const match = html.match(regExpObj)
  expect(match).not.toBeNull()
  expect(match[0]).toBe('<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the');
  const highlightedHtml = html.replace(regExpObj, '<mark>$&</mark>')
  console.log(highlightedHtml)
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

export {}