import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { ProxyHandlerOptions, ProxyTarget } from '@hapi/h2o2'
import { URLSearchParams } from 'url';


const mapUriHandler = (request: Request): Promise<ProxyTarget> => {
  try {
    const promise = new Promise<ProxyTarget>((resolve, reject) => {

      const protocol = request.server.info.protocol;
      const proxypath = request.params.proxypath;
      const proxyquery = new URLSearchParams(request.query);
      const uri:string = protocol + '://localhost:8108/' + proxypath + '?' + proxyquery.toString();
      //TODO: change host to configured
      console.log("Typesense Uri: " + uri)
      //console.log("Typesense req headers: ")
      //console.log (request.raw.req.headers)
      //console.log(request.auth.credentials)
      //console.log(request.auth.artifacts)
      console.log('')

      const proxytarget: ProxyTarget = {
        uri: uri,
        headers: {
          'X-TYPESENSE-API-KEY': `${process.env.TYPESENSE_API_KEY}`
        }
      };

      resolve(proxytarget);
      
    })

    return promise

  } catch (error) {
    console.error("error in mapUriHandler():")
    throw error
  }

}

// const onResponseHandler = async (err:any, res: IncomingMessage, req: Request, h: ResponseToolkit, settings: ProxyHandlerOptions, ttl: number) => {
  
//     const payload = await wreck.read(res, { json: true });   
//     const promise = new Promise<ResponseObject>((resolve, reject) => {
//       try {
//         const response: ResponseObject = h.response(payload);
//         console.log("response:", response)
//         resolve(response);
//       } catch (error) {
//         console.error("error in onResponseHandler():", err)  
//         reject(error)
//       }
//     });

//     return promise;
// }


/*
`scope` - checks against the scopes claim in the JWT. This makes sure we are enforcing against the consent the user gave.
There isn't a built in way to check against the `permissions` claim in the JWT, need to use  plugin. Permissions claim is what the app owner controls in the backend (Auth0).

*/



export const getRouteConfigTypesenseApi: ServerRoute =
{
  method: '*',
  path: '/typesense:80/{proxypath*}',
  handler: {
    proxy: {
      rejectUnauthorized: true, // make sure cert validation fails throw a 500
      passThrough: true, // pass all req and res headers
      mapUri: mapUriHandler,
      
      //onResponse: onResponseHandler,
      
    }
  }
}

