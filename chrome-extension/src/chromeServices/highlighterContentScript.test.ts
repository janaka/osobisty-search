test('<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)', () => {
  const text:string = '(<b>aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the)'
  const match = text.match('aka\s?<?.*?>?\s??The\s?<?.*?>?\s??Sephist\s?<?.*?>\s??the')
  expect(match[0]).toBe('aka <a href="https://twitter.com/thesephist">The Sephist</a></b>the');
});

export {}