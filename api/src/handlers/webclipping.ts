import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import joi from 'joi'

const schemaWebclipping = joi.object({
  type: joi.string().pattern(new RegExp('^highlight$')).example('highlight'),
  source_content: joi.string().required().description('Clipped text').example('Some text clipped from a website.'),
  content: joi.string().description('Notes related to the clipped text in `source_content`').example('Some nottes about the clipped text'),
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
        failAction: (request, h, err) => {
          throw err;
        }
      },

      response:{
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


      //const hashPageUrl = "sdhfsufosdufosuds453sfs"
      //const fqFilePath = os.homedir + "/code-projects/osobisty-search/api/data/highlights/" + hashPageUrl + ".json"
      //let t: string = JSON.stringify(content)
      //const fmSection:string = serialiseFrontMatter(frontMatterFields)
      //const t:string  = fmSection + content 

      // fs.writeFile(fqFilePath, t, "utf-8", (err: any) => {
      //   if (err) throw err
      // })
      res.code(200)
      return res
    }
  }
}


