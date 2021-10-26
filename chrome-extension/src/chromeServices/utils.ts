export function generateHighlightMarkup(highlightRawText: string, innerHTML: string) {
  let highlightFound:boolean = false;
  let matchedHtml:string | null = null;
  const matchRegExStep1 = highlightRawText.replace(new RegExp('\\s|\\(|\\)', 'g'), '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?\\$&?(?:<[a-zA-Z0-9"/:=.\\s]*?>)?') // escape regex special char in text
  const matchRegExStep2 = '(?:<[a-zA-Z0-9"/:=.\\s]*?>)?' + matchRegExStep1 + '(?:<\\/[a-zA-Z0-9"/:=.\\s]*?>)?' 
  const regExpObj = new RegExp(matchRegExStep2, 'g')
  const match: RegExpMatchArray | null = innerHTML.match(regExpObj)
  
  if (match != null) { 
      highlightFound = true;
      matchedHtml = match[0].toString();
  }
  const highlightedHtml = innerHTML.replace(regExpObj, '<mark>$&</mark>')

  return {'highlightedHtml': highlightedHtml, 'highlightRegExObj': regExpObj, 'highlightMatchFound': highlightFound, 'RegExpMatchedHtml': matchedHtml}
}