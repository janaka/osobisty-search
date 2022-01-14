import { Request, ResponseObject } from '@hapi/hapi';


export namespace TypesenseApiProxy {
  export const getRouteConfig: any = {
    method: 'GET',
    path: '/typesense/{proxypath}',
    handler: {
      proxy: {
        uri: '{protocol}://localhost:8108/{proxypath}'
      }
    }
  }
}