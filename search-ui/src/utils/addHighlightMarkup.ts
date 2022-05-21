export function addHightlightMarkup(tsHitDataObj: any, fieldname: string): string {
  let fieldvalue: string = tsHitDataObj.document[fieldname];
  // deepcode ignore PureMethodReturnValueIgnored: <please specify a reason of ignoring this>
  tsHitDataObj.highlights.map((highlight: any) => {
    if (highlight.field == fieldname) {
      highlight.matched_tokens.map((match_token: string) => (
        fieldvalue = tsHitDataObj.document[fieldname].replaceAll(match_token, "<mark>" + match_token + "</mark>")
      ))
    }
  })
  return fieldvalue
}