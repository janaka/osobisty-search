import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { ProxyHandlerOptions, ProxyTarget } from '@hapi/h2o2'
import { URLSearchParams } from 'url';
import { IncomingMessage } from 'http';
import wreck from '@hapi/wreck'



interface TypesenseAuthorisationResult {
  IsAuthorised: boolean,
  TypesenseApiKey: string,
}


const mapUriHandler = (request: Request): Promise<ProxyTarget> => {
  try {
    const promise = new Promise<ProxyTarget>((resolve, reject) => {

      const protocol = request.server.info.protocol;
      const proxypath = request.params.proxypath;
      const proxyquery = new URLSearchParams(request.query);
      const typesensehost: string = process.env.TYPESENSE_HOST ? process.env.TYPESENSE_HOST : "";
      const typesenseport: string = process.env.TYPESENSE_PORT ? process.env.TYPESENSE_PORT : "";
      var uri: string = protocol + '://' + typesensehost + ':' + typesenseport + '/' + proxypath;
      if (globalThis.DEBUG) console.log(proxyquery)
      if (proxyquery.toString().length > 0) {
        uri = uri + '?' + proxyquery.toString()
      }
      const authresult = authoriseTypesenseRequest(request)

      if (globalThis.DEBUG) {
        console.log("Typesense Uri: " + request.method + " " + uri)
        console.log("auth.credentials:", request.auth.credentials.permissions)
        //console.log(request.info)
        //console.log("Typesense req headers: ")
        //console.log (request.raw.req.headers)
        //console.log(request.auth.credentials)
        //console.log(request.auth.artifacts)
        console.log(authresult)
        console.log('----')
      }

      const proxytarget: ProxyTarget = {
        uri: uri,
        headers: {
          'X-TYPESENSE-API-KEY': `${authresult.TypesenseApiKey}`
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

function authoriseTypesenseRequest(request: Request): TypesenseAuthorisationResult {

  let result: TypesenseAuthorisationResult = { IsAuthorised: false, TypesenseApiKey: "" };

  const permissions: Array<string> = request.auth.credentials.permissions as Array<string>;
  const path: string = request.path;
  var apikey;

  if (permissions.includes("admin:typesense")) {
    result.IsAuthorised = true;
    apikey = mapTypesenseApiKey("admin:typesense");
    result.TypesenseApiKey = apikey
  } else {
    if (permissions.includes("write:zettleDocuments")) {
      result.IsAuthorised = true;
      apikey = mapTypesenseApiKey("write:zettleDocuments");
      result.TypesenseApiKey = apikey
    } else {
      if (permissions.includes("read:zettleDocuments")) {
        result.IsAuthorised = true;
        apikey = mapTypesenseApiKey("read:zettleDocuments");
        result.TypesenseApiKey = apikey
      } else {
        console.warn("You don't have needed permissions to interact with the Typesense zettleDocuments!")
      }
    }
  }

  return result;
}

/**
 * map a permission to a typesense key
 * @param permission a permission 
 * @returns 
 */
function mapTypesenseApiKey(permission: string): string {
  let apikey: string = "";
  switch (permission) {
    case "admin:typesense":
      apikey = process.env.TYPESENSE_API_KEY_ADMIN ? process.env.TYPESENSE_API_KEY_ADMIN : "";
      if (apikey === "") {
        console.error("Env variable `TYPESENSE_API_KEY_ADMIN` is empty!");
        throw new Error("Env variable `TYPESENSE_API_KEY_ADMIN` is empty!")
      }
      break;

    case "read:zettleDocuments":

      apikey = process.env.TYPESENSE_API_KEY_READ_ZETTLEDOCS ? process.env.TYPESENSE_API_KEY_READ_ZETTLEDOCS : "";
      if (apikey === "") {
        console.error("Env variable `TYPESENSE_API_KEY_READ_ZETTLEDOCS` is empty!");
        throw new Error("Env variable `TYPESENSE_API_KEY_READ_ZETTLEDOCS` is empty!")
      }
      break;
    case "write:zettleDocuments":
      apikey = process.env.TYPESENSE_API_KEY_WRITE_ZETTLEDOCS ? process.env.TYPESENSE_API_KEY_WRITE_ZETTLEDOCS : "";
      if (apikey === "") {
        console.error("Env variable `TYPESENSE_API_KEY_WRITE_ZETTLEDOCS` is empty!");
        throw new Error("Env variable `TYPESENSE_API_KEY_WRITE_ZETTLEDOCS` is empty!")
      }
      break;
    default:
      apikey = "";
      console.warn("warning: mapTypesenseApiKey() no Typesense scope map match for " + permission);

      break;
  }

  return apikey

}

function isEven(n: number) {
  return n % 2 == 0;
}

const onResponseHandler = (err: any, res: IncomingMessage, req: Request, h: ResponseToolkit, settings: ProxyHandlerOptions, ttl: number) => {

  const response: ResponseObject = h.response(res);

  var key: string = "", value: string = ""
  for (let index = 0; index < res.rawHeaders.length; index++) {

    if (isEven(index)) {
      key = res.rawHeaders[index];
    } else {
      value = res.rawHeaders[index];
    }
    response.header(key, value)
  }
  if (globalThis.DEBUG) console.log(`onResponse(): isOriginMatch: ${req.info.cors.isOriginMatch}`)  
  if (req.info.cors.isOriginMatch) {
    response.header('Access-Control-Allow-Origin', req.info.host); //'https://osobisty-search-ui.onrender.com'
  }

  return response;
}



/*
`scope` - checks against the scopes claim in the JWT. This makes sure we are enforcing against the consent the user gave.
There isn't a built in way to check against the `permissions` claim in the JWT, need to use  plugin. Permissions claim is what the app owner controls in the backend (Auth0).

*/

// const onResponse1 = function (err:any, res: IncomingMessage, req: Request, h: ResponseToolkit, settings: ProxyHandlerOptions, ttl: number) {

//   return h.response(res).vary('Something');
// };

export const getRouteConfigTypesenseApi: ServerRoute =
{
  method: ['GET', 'POST', 'DELETE', 'PUT'], // change this to exclude OPTIONS from being proxied
  path: '/typesense:80/{proxypath*}', // this `typesense:80` is a TypeSense client side hack so we have something to match the route
  handler: {
    proxy: {
      rejectUnauthorized: true, // make sure cert validation fails throw a 500
      passThrough: true, // pass all req and res headers
      mapUri: mapUriHandler,
      onResponse: onResponseHandler,

    }
  }
}

