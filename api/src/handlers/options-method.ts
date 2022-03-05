import { Request, ResponseObject} from '@hapi/hapi';



export namespace optionsMethod {
  export const getRouteConfig: any = {
    method: 'OPTIONS',
    path: '/{any*}',
    options: {
      auth: false
    },
    handler: (req: Request, h: any) => {
      console.log(`======options: ${req.route.path}`)
      const response = h.response({})
      response.header('Access-Control-Allow-Origin',   'https://osobisty-search-ui.onrender.com') //, https://localhost:3001
      response.header('Access-Control-Allow-Headers',  'authorization')
      return response;
    }
  }
}


// {
//   method : 'OPTIONS',
//   path: '/{any*}',
//   handler : async (request, reply) => {
//       console.log(`======options: ${request.route.path}`)
//       const response = reply.response({})
//       response.header('Access-Control-Allow-Origin',   '*')
//       response.header('Access-Control-Allow-Headers',  '*')
//       return response;
//       }
//   }