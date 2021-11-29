import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import joi, { object, ValidationError } from 'joi';
import fs from 'fs';
import os from 'os';
import { Dbms, DbmsConfig, Collection, Document, JsonFileAdaptor } from '../dbms/dbms.js'
import { generateIdFromText } from '../dbms/idFromText.js';
import { WebClipPageDbSchema, WebClipDbSchema } from './webclippageDBSchema.js';
import { generateClippingPageFilename } from '../models/generateClippingPageFilename.js';
import { URL } from 'url';

const dbConfig: DbmsConfig = {
  // TODO: move these paths into  config / .env
  dataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/prod",
  metaDataRootPath: os.homedir + "/code-projects/osobisty-search/api/data/prod/meta"
}

interface reqClipSchema {
  clip_id?: string,
  source_content: string,
  notes_content: string,
  matched_html: string,
  page_url: string
}

const schemaWebclipping = joi.object<reqClipSchema>({
  clip_id: joi.string().description("If clip_id is present, corresponding clip is updated."),
  source_content: joi.string().required().description('Clipped text').example('Some text clipped from a website.'),
  notes_content: joi.string().description('Notes related to the clipped text in `source_content`').example('Some nottes about the clipped text'),
  matched_html: joi.string().base64().description('The clipped `source_content` including any innerHTML base64 encoded. Makes highlighting easier on next page viist'),
  page_url: joi.string().required().uri({ scheme: ['http', 'https', 'kindle'] }).description('URi of the page the text was clipped from').example('https://www.google.com')
}).label('webclipping')


  export const postRouteConfigWebclippings: ServerRoute = {
    method: ['POST', 'PUT'],
    path: '/webclippings',
    options: {
      description: 'Create a new webclpping. If the web clip already exists then all fields are updated with the the payload. If the clip_id is present it is used to find the clip. Otherwise the id is computed using the clip content in the `source_content` field.',
      tags: ['api'],
      validate: {
        payload: schemaWebclipping,
        failAction: (request: Request, h: ResponseToolkit, err: any) => {
          console.error("request "+err);
          console.error("request payload: " + JSON.stringify(request.payload))
          //throw new Error("request validation error: " + err);
          throw err
        // note: if you `throw new Error()` here it overrides the resopone with a generic 500
        }
      },
      response: {
        schema: joi.object({
          message: joi.string().pattern(new RegExp('^created$')).example('created'),
          webClippingData: joi.object({
            clipId: joi.string().description("Unique ID for the page generated using the clip text").example('08234939'),
            clipPageId: joi.string().description("Unique ID for the page generated using the page URL").example('29384748')
          })
        }).label('webClippingResponse'),
        failAction: 'error'
        // failAction: (request: any, h: any, err: any) => {
        //   console.error("response "+err);
        //   throw err;
        // }
      },
    },

    handler: (req: Request, h: ResponseToolkit) => {

      let res: ResponseObject;

      try {

        const db: Dbms = new Dbms(dbConfig); // TODO: this needs to be a singleton. Move intantiation to api-server.ts
        //console.log(req.payload)
        const reqPayload: reqClipSchema = req.payload as reqClipSchema

        const clipPageId: string = generateIdFromText(new URL(reqPayload.page_url).toString()).toString()
        const filename: string = generateClippingPageFilename(clipPageId, reqPayload.page_url)

        const webPageCollection = db.Collections.has("webclippings") ? db.Collections.get("webclippings") : db.Collections.add("webclippings")
        if (webPageCollection === undefined) throw new Error("collection has() check pass but returned undefined. Possible data or index curruption?")

        let doc: Document | undefined;
          let webPage: WebClipPageDbSchema = {id:"0", page_url:"-", clippings: []};
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

        const clipId: string = reqPayload.clip_id ? reqPayload.clip_id : generateIdFromText(reqPayload.source_content).toString() // generateClipId(reqPayload.source_content);

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
        console.error("catch all error handler: " + error)
        
          res = h.response({ message: "error" })
          res.code(500)
      }
      return res
    }
  }





export { }
