import fs from 'fs'

//TODO: makes sense to turn this into a class that handles a MD doc with FrontMatter yaml
//TODO: create and use a fileAdaptor class to handle persistence

export interface frontMatterFieldCollection { [key: string]: any }

/**
 * string to a frontMatterFieldCollection
 * @param frontMatterSectionRaw raw FrontMatter header including the delimiters 
 * @returns frontMatterFieldCollection
 */
export function deserialiseFrontMatter(frontMatterSectionRaw: string): frontMatterFieldCollection {
  let fmFields: frontMatterFieldCollection = {}
  const fmDelimiter = "---\n"
  const fmOpenDelimiterStartPosition = frontMatterSectionRaw.indexOf(fmDelimiter, 0)
  const fmOpenDelimiterEndPositon = fmOpenDelimiterStartPosition + fmDelimiter.length
  const fmCloseDelimiterStartPosition = frontMatterSectionRaw.indexOf(fmDelimiter, fmOpenDelimiterEndPositon)
  //const fmCloseDelimiterEndPosition = fmCloseDelimiterStartPosition + fmDelimiter.length

  const fmFieldSection = frontMatterSectionRaw.slice(fmOpenDelimiterEndPositon, fmCloseDelimiterStartPosition)
  const fmSectionArray = fmFieldSection.split("\n")
  console.log("# elements: " + fmSectionArray.length)
  console.log("element 0: " + fmSectionArray[0])

  fmSectionArray.forEach((e: string) => {
    //let fmField = e.split(":")
    const key: string = e.slice(0, e.indexOf(":")).trim()
    const value: string = e.slice(e.indexOf(":") + 1, e.length).trim()

    fmFields[key] = value
  })
  return fmFields
}

/**
 * frontMatterFieldCollection to a string
 * @param frontMatterFieldCollection 
 * @returns serialised frontMatterChunk as a string
 */
export function serialiseFrontMatter(frontMatterFieldCollection: frontMatterFieldCollection): string {
  const fmDelimiter = "---\n"
  
  let t: string = fmDelimiter

  for (const key in frontMatterFieldCollection) {
    t += key + ": " + frontMatterFieldCollection[key] + "\n"
  };

  t += fmDelimiter
  
  return t
}



/** 
 * Update FrontMatter in a text file, tylically in Markdown format
 * @param fqFilePath
 * @param frontMatterFieldCollection
 *
 */
export async function updateFrontMatter(fqFilePath: string, FontMatterFieldCollection: frontMatterFieldCollection) {

  // TODO: Check if MD file has an _Id_ field
  // if not, generate an unique Id and insert the field


  //const filepath = os.homedir + "/code-projects/zettelkasten/projects/osobisty personal universal search engine.md"

  
  fs.readFile(fqFilePath, "utf-8", (err: any, data: any) => {
    if (err) throw err;
    let dataStr: string = data;
    let fmData: frontMatterFieldCollection = {}
    const fmDelimiter = "---\n"
    //const fmOpenPosition = fmDelimiter.length
    //const fmClosePostion = dataStr.indexOf(fmDelimiter, fmOpenPosition)

    const fmOpenDelimiterStartPosition = dataStr.indexOf(fmDelimiter, 0)
    const fmOpenDelimiterEndPositon = fmOpenDelimiterStartPosition + fmDelimiter.length
    const fmCloseDelimiterStartPosition = dataStr.indexOf(fmDelimiter, fmOpenDelimiterEndPositon)
    const fmCloseDelimiterEndPosition = fmCloseDelimiterStartPosition + fmDelimiter.length
    
    const fmSectionRaw = dataStr.slice(fmOpenDelimiterStartPosition, fmCloseDelimiterEndPosition)
    //const fmSection = dataStr.slice(fmOpenPosition, fmClosePostion - 1)
    //const fmSection = dataStr.slice(fmOpenDelimiterEndPositon, fmCloseDelimiterStartPosition)
    //const contentSection = dataStr.slice(fmClosePostion + fmDelimiter.length)
    const contentSection = dataStr.slice(fmCloseDelimiterEndPosition)
    //console.log(fmSection)
    

    fmData = deserialiseFrontMatter(fmSectionRaw)

    // loop through fields update.

    let t: string = serialiseFrontMatter(fmData)
    t += contentSection


    fs.writeFile(fqFilePath, t, "utf-8", (err: any) => {
      if (err) throw err
    })


  })

}
