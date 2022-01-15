import { Request, ResponseObject, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { ProxyHandlerOptions, ProxyTarget } from '@hapi/h2o2'
import { URLSearchParams } from 'url';
import wreck from '@hapi/wreck';
import { IncomingMessage } from 'http';

const mapUriHandler = function (request: Request): Promise<ProxyTarget> {
  try {
    const promise = new Promise<ProxyTarget>((resolve, reject) => {

      const protocol = request.server.info.protocol;
      const proxypath = request.params.proxypath;
      const proxyquery = new URLSearchParams(request.query);
      const uri = protocol + '://localhost:8108/' + proxypath + '?' + proxyquery.toString();
      console.log("Typesense Uri: " + uri)
      //console.log("Typesense req headers: ")
      //console.log (request.raw.req.headers)
      console.log('')

      const proxytarget: ProxyTarget = {
        uri: uri,
        headers: {
          'X-TYPESENSE-API-KEY': 'xyz' // TODO: switch to environment variable before prod
        }
      };

      resolve(proxytarget);
    }

    )
    return promise

  } catch (error) {
    throw error
  }

}

const onResponseHandler = async (err:any, res: IncomingMessage, req: Request, h: ResponseToolkit, settings: ProxyHandlerOptions, ttl: number) => {

  const payload = await wreck.read(res, { json: true });  
  const response = h.response(payload);

  return response;
}



export const getRouteConfigTypesenseApi: ServerRoute =
{
  method: '*',
  path: '/typesense:80/{proxypath*}',
  // options: {
  //   auth: 'jwt'
  // },
  handler: {
    proxy: {
      mapUri: mapUriHandler,
      onResponse: onResponseHandler
    }
  }
}

