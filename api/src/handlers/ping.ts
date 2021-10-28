import { Request } from '@hapi/hapi';

module.exports = {
  get: function (req:Request, h:any) { 
    return "hello world!"
  }
}

// server.route({
//   method: 'GET',
//   path: '/hello',
//   handler: async (request: Request, h: any) => {

//     return 'Hello World!!!';
//   }
// });