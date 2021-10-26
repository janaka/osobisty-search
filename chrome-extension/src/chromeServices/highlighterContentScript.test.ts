

export function generateHighlightMarkup(highlightRawText: string, innerHTML: string) {
  let highlightFound:boolean = false;
  let matchedHtml:string | null = null;
  const matchRegExStep1 = highlightRawText.replace(new RegExp('\\s|\\(|\\)', 'g'), '(?:<.*?>)?\\$&?(?:<.*?>)?') // escape regex special char in text
  const matchRegExStep2 = '(?:<.*?>)?' + matchRegExStep1 + '(?:<\\/.*?>)?' 
  const regExpObj = new RegExp(matchRegExStep2, 'g')
  const match: RegExpMatchArray | null = innerHTML.match(regExpObj)
  
  if (match != null) { 
      highlightFound = true;
      matchedHtml = match[0].toString();
  }
  const highlightedHtml = innerHTML.replace(regExpObj, '<mark>$&</mark>')

  return {'highlightedHtml': highlightedHtml, 'highlightRegExObj': regExpObj, 'highlightMatchFound': highlightFound, 'RegExpMatchedHtml': matchedHtml}
}


test('match just element wrapped text', () => {
  const html:string = 'Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his';
  const highlightRawText:string = 'The Sephist';
  const highlightedObj = generateHighlightMarkup(highlightRawText, html)
  expect(highlightedObj.RegExpMatchedHtml).toBe('<a href="https://twitter.com/thesephist">The Sephist</a>')
});


test('match element immediately followed by closing bracket', () => {
  const html:string = 'Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk about his';
  const highlightRawText:string = '(aka The Sephist) talk';
  const highlightedObj = generateHighlightMarkup(highlightRawText, html)
  expect(highlightedObj.RegExpMatchedHtml).toBe('(aka <a href="https://twitter.com/thesephist">The Sephist</a>) talk')
});


test('match open bracket immediately followed by element', () => {
  const html:string = 'Lee (<a href="https://twitter.com/thesephist">The Sephist</a>) talk about his';
  const highlightRawText:string = '(The Sephist) talk';
  const highlightedObj = generateHighlightMarkup(highlightRawText, html)
  expect(highlightedObj.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>) talk')
});

test('match element just wrapped in brackets', () => {
  const html:string = '(<a href="https://twitter.com/thesephist">The Sephist</a>)';
  const highlightRawText:string = '(The Sephist)';
  const highlightedObj = generateHighlightMarkup(highlightRawText, html)
  expect(highlightedObj.RegExpMatchedHtml).toBe('(<a href="https://twitter.com/thesephist">The Sephist</a>)')
});

test('match mid element highlight', () => {
  const html:string = 'Lee (aka <a href="https://twitter.com/thesephist">The Sephist</a>)';
  const highlightRawText:string = 'Lee (aka The';
  const highlightedObj = generateHighlightMarkup(highlightRawText, html)
  expect(highlightedObj.RegExpMatchedHtml).toBe('Lee (aka <a href="https://twitter.com/thesephist">The')
});


export {}