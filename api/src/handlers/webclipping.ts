import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import joi from 'joi';
import fs from 'fs';
import { URL } from 'url';
import { Dbms, DbmsConfig, Collection, JsonFileAdaptor } from '../utils/dbms'
const { createHash } = await import('crypto');

const dbConfig: DbmsConfig = {
  dataRootPath: "/Users/janakaabeywardhana/code-projects/osobisty-search/api/data",
  metaDataRootPath: "/Users/janakaabeywardhana/code-projects/osobisty-search/api/metadata"
}
const db: Dbms = new Dbms(dbConfig);



interface WebClipDbSchema {
  source_content: string,
  notes_content: string,
  source_html: string,
}
interface WebClipPageDbSchema {
  id: string,
  page_url: string,
  clippings: [WebClipDbSchema]
}

const schemaWebclipping = joi.object({
  type: joi.string().pattern(new RegExp('^highlight$')).example('highlight'),
  source_content: joi.string().required().description('Clipped text').example('Some text clipped from a website.'),
  content: joi.string().description('Notes related to the clipped text in `source_content`').example('Some nottes about the clipped text'),
  matched_html: joi.string().base64().description('The clipped `source_content` including any innerHTML base64 encoded. Makes highlighting easier on next page viist'),
  link: joi.string().uri({ scheme: ['http', 'https', 'kindle'] }).required().description('URi of the page the text was clipped from').example('https://www.google.com')
}).label('webclipping')

export namespace webclippings {
  export const postRouteConfig: ServerRoute = {
    method: 'POST',
    path: '/webclippings',
    options: {
      description: 'Create a new webclpping',
      tags: ['api'],
      validate: {
        payload: schemaWebclipping,
        failAction: (request:any, h:any, err:any) => {
          throw err;
        }
      },

      response: {
        schema: joi.object({
          message: joi.string().pattern(new RegExp('^created$')).example('created'),
          webClippingData: joi.object({
            id: joi.string().guid().example('aba37142-384f-11ec-8d3d-0242ac130003')
          })
        }).label('webClippingResponse')
      }
    },

    handler: (req: Request, h: ResponseToolkit) => {

      const res: ResponseObject = h.response({ message: "created", webClippingData: { id: 'aba37142-384f-11ec-8d3d-0242ac130003' } })
      console.log(req.payload)

      const reqPayload = JSON.parse(req.payload.toString())
      //const hashPageUrl = "sdhfsufosdufosuds453sfs"
      //const fqFilePath = os.homedir + "/code-projects/osobisty-search/api/data/highlights/" + hashPageUrl + ".json"
      //let t: string = JSON.stringify(content)
      //const fmSection:string = serialiseFrontMatter(frontMatterFields)
      //const t:string  = fmSection + content 

      // fs.writeFile(fqFilePath, t, "utf-8", (err: any) => {
      //   if (err) throw err
      // })

      // if file for URL doesn't exit 
      //    filename = domain + - + hash of URL
      // create json file 
      //    one json file per web page
      //    filename = domain + - + hash of URL
      //    {pageUrl: '',
      //     clippings: []     
      //      }
      // else read the file as json
      //    add new clipping entry
      //    save file

      const filename:string = generateClippingPageFilename(reqPayload.link)
      const webclippagefile = new JsonFileAdaptor("ewe",filename)

      db.Collections.push(new Collection(filename, db))


      res.code(200)
      return res
    }
  }
}

/**
 * 
 * @param clippingPageUrl 
 * @returns filename = domain + --- + hash of URL
 */
function generateClippingPageFilename(clippingPageUrl: string): string {
  let filename = "";
  //filename = domain + --- + hash of URL
  const url = new URL(clippingPageUrl)

  const hash = createHash('sha256')

  hash.update(url.toString())

  filename = url.hostname + "---" +  hash.digest('hex');
  return filename
}

// function loadClippingPageDataFile(clippingPageUrl: string): object {
//   const pageData: object = {};
//   return pageData
// }
