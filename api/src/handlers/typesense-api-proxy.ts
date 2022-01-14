import { Request, ResponseObject, ServerRoute } from '@hapi/hapi';
import { ProxyTarget } from '@hapi/h2o2'

const mapUriHandler = function (request: Request): Promise<ProxyTarget> {
  try {
    const promise = new Promise<ProxyTarget>((resolve, reject) => {

      const protocol = request.server.info.protocol
      const proxypath = request.params.proxypath
      const uri = protocol+'://localhost:8108/'+proxypath

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

export const getRouteConfigTypesenseApi: ServerRoute =
{
  method: '*',
  path: '/typesense/{proxypath}',
  handler: {
    proxy: {
      mapUri: mapUriHandler
    }
  }
}




