export function addHightlightMarkup(tsHitDataObj: any, fieldname: string): string {
  let fieldvalue: string = "";
console.log(tsHitDataObj)
console.log(fieldname)
  if (tsHitDataObj !== undefined && fieldname!=="" && tsHitDataObj.document[fieldname]) {

    fieldvalue = tsHitDataObj.document[fieldname];
    // deepcode ignore PureMethodReturnValueIgnored: <please specify a reason of ignoring this>
    tsHitDataObj.highlights.map((highlight: any) => {
      if (highlight.field == fieldname) {
        highlight.matched_tokens.map((match_token: string) => (
          fieldvalue = tsHitDataObj.document[fieldname].replaceAll(match_token, "<mark>" + match_token + "</mark>")
        ))
      }
    })
  }
  return fieldvalue
}