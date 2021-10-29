import Hapi, { Server, Request } from '@hapi/hapi';
import * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

import cors from 'cors';

import dotenv from 'dotenv';
import fs, { cp } from 'fs';
import os from 'os';
import Path from 'path';
import { frontMatterFieldCollection, serialiseFrontMatter } from './utils/frontmatter.js'

import { ping } from './handlers/ping.js'
import { webclippings } from './handlers/webclipping.js';
import routes from './handlers/index.js'

dotenv.config();

// Configuration
const PORT = 3002;
const HOST = "localhost";

// Hapi lifecycle methods 
// https://livebook.manning.com/book/hapi-js-in-action/chapter-5/30

// const client_id: string | undefined = process.env.REACT_APP_CLIENT_ID
// const client_secret = process.env.REACT_APP_CLIENT_SECRET
// const code = process.env.REACT_APP_CODE
// const access_token = process.env.REACT_APP_ACCESS_TOKEN

var corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

let server: Server = Hapi.server({
  port: PORT,
  host: HOST,
  debug: { request: ['error'] }
});

//app.use(cors(corsOptions));
// Logging
//app.use(morgan('dev'));
const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
      title: 'Osobisty API'
  }
};

const plugins: Array<Hapi.ServerRegisterPluginObject<any>> = [
  {
      plugin: Inert
  },
  {
      plugin: Vision
  },
  {
      plugin: HapiSwagger,
      options: swaggerOptions
  }
];

await server.register(plugins);

const init = async () => {

  await server.start();
  console.log('Server running on %s', server.info.uri);
  
  server.table().forEach((route) => {
    console.log(route.path);
  });
  

  
};

// server.route(ping.getRouteConfig);

// server.route(webclippings.postRouteConfig);

server.route(routes)

// //catch all 404
// server.route({
//   method: '*',
//   path: '/{any*}',
//   handler: function (request, h) {

//     return h.response('404 Page Not Found!').code(404);
//   }
// })




// const postWebClipping = async (request: Request, h: any) => {

//   const reqPayload = request.payload
//   console.log(reqPayload)


//   await saveWebClipping(reqPayload)

//   return h.response('created').code(201)
// }

// server.route({
//   method: 'POST',
//   path: '/webclipping',
//   handler: postWebClipping
// });



// /**
//  * 
//  * @param fqFilePath 
//  */
// export async function saveWebClipping(content: any) {

//   const hashPageUrl = "sdhfsufosdufosuds453sfs"
//   const fqFilePath = os.homedir + "/code-projects/osobisty-search/api/data/highlights/" + hashPageUrl + ".json"
//   let t: string = JSON.stringify(content)
//   //const fmSection:string = serialiseFrontMatter(frontMatterFields)
//   //const t:string  = fmSection + content 

//   fs.writeFile(fqFilePath, t, "utf-8", (err: any) => {
//     if (err) throw err
//   })

// }

process.on('unhandledRejection', (error) => {
  console.log(error);
  process.exit(1);
});

init();