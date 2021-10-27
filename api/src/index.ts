import Hapi, {Server, Request} from '@hapi/hapi';
import morgan from 'morgan';
import cors from 'cors';

import dotenv from 'dotenv';
import https from 'https'
import { isConstTypeReference } from 'typescript';
import { cp } from 'fs';

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

let server: Server;

//app.use(cors(corsOptions));
// Logging
//app.use(morgan('dev'));
const init = async () => {

  server = Hapi.server({
    port: PORT,
    host: HOST
  });

  server.route({
    method: 'GET',
    path: '/hello',
    handler: async (request:Request, h:any) => {

      return 'Hello World!!!';
    }
  });

  //catch all 404
  server.route({
    method: '*',
    path: '/{any*}',
    handler: function (request, h) {

        return h.response('404 Page Not Found!').code(404);
    }
})

  server.route({
    method: 'POST',
    path: '/zettle/document',
    handler: postZettleDocument
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};


const postZettleDocument = async (request:Request, h: any) => {
  
  const reqBody = request.payload
  console.log(reqBody)
  return h.response('created').code(201)
}


process.on('unhandledRejection', (error) => {
  console.log(error);
  process.exit(1);
});

init();