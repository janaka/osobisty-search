import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import joi, { object } from 'joi';
import os from 'os';
import { URL } from 'url';
import { Dbms, DbmsConfig, Collection, Document, JsonFileAdaptor } from '../dbms/dbms.js'
import { generateIdFromText } from '../dbms/idFromText.js';


const dbConfig: DbmsConfig = {
  // TODO: move these paths into  config / .env
  dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/prod",
  metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/prod/meta"
}


interface resSchema {
    id: string,
    page_url: string,
    clippings: Array<{
      id: string,
      source_content: string, // plain text
      notes_content: string,
      source_content_html: string,
    }>
}


// const schemaWebclipping = joi.object<reqSchema>({
//   source_content: joi.string().required().description('Clipped text').example('Some text clipped from a website.'),
//   notes_content: joi.string().description('Notes related to the clipped text in `source_content`').example('Some nottes about the clipped text'),
//   matched_html: joi.string().base64().description('The clipped `source_content` including any innerHTML base64 encoded. Makes highlighting easier on next page viist'),
//   page_url: joi.string().uri({ scheme: ['http', 'https', 'kindle'] }).required().description('URi of the page the text was clipped from').example('https://www.google.com')
// }).label('webclipping')



  export const getRouteConfigWebclippings: ServerRoute = {
    method: 'GET',
    path: '/webclippings/{id}',
    options: {
      description: 'Create a new webclpping',
      tags: ['api'],
      validate: {
        params: joi.object({
          id: joi.string().min(4).max(8).description("ID of a web clip page")
        }),
        failAction: (request: any, h: any, err: any) => {
          console.error(err);
          throw new Error(err);
        }
      },

      response: {
        schema: joi.object({
          message: joi.string().pattern(new RegExp('^success$')).example('success'),
          webClippingData: joi.object<resSchema>({            
            id: joi.string().description("Unique ID for the page generated using the page URL").example('29384748'),
            page_url: joi.string(),
            clippings: joi.array().items({
              id: joi.string().description("Unique ID for the page generated using the clip text").example('08234939'),
              source_content: joi.string(),
              source_content_html: joi.string(),
              notes_content: joi.string(),
            })
          })
        }).label('webClippingResponse')
      }
    },

    handler: (req: Request, h: ResponseToolkit) => {

      let res: ResponseObject;
      const clipPageId = req.params.id

      try {

        const db: Dbms = new Dbms(dbConfig); // TODO: this needs to be a singleton. Move intantiation to api-server.ts
        console.log(req.payload)
        

        //const clipPageId: string = generateIdFromText(new URL(reqPayload.page_url).toString()).toString()
        //const filename: string = generateClippingPageFilename(clipPageId, reqPayload.page_url)

        const webPageCollection = db.Collections.has("webclippings") ? db.Collections.get("webclippings") : db.Collections.add("webclippings")
        if (webPageCollection === undefined) throw new Error("collection has() check pass but returned undefined. Possible data or index curruption?")

        let doc: Document | undefined;
        //let webPage: WebClipPageDbSchema = {id:"0", page_url:"-", clippings: new Array<WebClipDbSchema>()};
        if (webPageCollection.Documents.has(filename)) {
          doc = webPageCollection.Documents.get(filename)
          if (doc === undefined) throw new Error("doc has() check passed but doc undefiend. Possible data or index corruption")
          //Object.setPrototypeOf(d?.data, w.prototype)
          
          console.log("doc exists")
        } else {
          doc = webPageCollection.Documents.add(filename)
          console.log("doc does NOT exist")
        }

        if (doc.data === undefined) {
          // if the doc exists in the DB but empty.
          webPage.id = clipPageId
          webPage.page_url = reqPayload.page_url
        } else {
          webPage = doc.data as WebClipPageDbSchema
        }

        const clipId: string = generateIdFromText(reqPayload.source_content).toString() // generateClipId(reqPayload.source_content);

        const index = webPage.clippings.findIndex(i => i.id === clipId)
        if (index > -1) {
          webPage.clippings[index].notes_content = reqPayload.notes_content
          webPage.clippings[index].source_content = reqPayload.source_content
          webPage.clippings[index].source_content_html = reqPayload.matched_html
        } else {
          webPage.clippings.push({id: clipId, source_content: reqPayload.source_content, notes_content: reqPayload.notes_content, source_content_html: reqPayload.matched_html})
        }
        
        doc.data = webPage
        doc.save();

        res = h.response({ message: "created", webClippingData: { clipId: clipId, clipPageId: clipPageId }})
        res.code(200)

      } catch (error) {
        console.error(error)
        res = h.response({ message: "error" })
        res.code(500)
      }
      return res
    }
  }


/**
 * Generate the filename given the URL. This should generate the same results given the same URL.
 * @param {string} clippingPageId - unique ID for the page
 * @param {string} clippingPageUrl - 
 * @returns filename = domain + --- + hash of URL
 */
function generateClippingPageFilename(clippingPageId: string, clippingPageUrl: string): string {
  //filename = domain + --- + hash of URL
  const url = new URL(clippingPageUrl)

  const filename = url.hostname + "---" + clippingPageId;
  return filename
}




export { }
