export function addHtmlFormatting(content: string): string {
  let _content = content;

  _content = "<p>" + _content + "</p>"
  _content = _content.replace(/[\n]{2}/g, "</p><p>")

  return _content
}