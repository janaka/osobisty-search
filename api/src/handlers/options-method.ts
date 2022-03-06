import { Request } from '@hapi/hapi';

export namespace optionsMethod {
  export const getRouteConfig: any = {
    method: 'OPTIONS',
    path: '/{any*}',
    options: {
      auth: false
    },
    handler: (req: Request, h: any) => {
    
      if (globalThis.DEBUG) console.log(`======options: ${req.route.path}`);

      const response = h.response({})
      if (req.info.cors.isOriginMatch) {
        response.header('Access-Control-Allow-Origin', req.info.host) //, https://localhost:3001
        response.header('Access-Control-Allow-Headers', 'authorization')
      }      
      return response;
    }
  }
}