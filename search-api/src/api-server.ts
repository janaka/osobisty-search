import Hapi, { Server } from '@hapi/hapi';
import hapiswagger, * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'

import cors from 'cors';

import dotenv from 'dotenv';

//import { frontMatterFieldCollection, serialiseFrontMatter } from './frontmatter.js'

import routes from './handlers/index.js'

dotenv.config();

// Configuration
const PORT = 3008;
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

const version = process.env.npm_package_version;
const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
      title: 'Osobisty API',
      version: version
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


let server: Server = Hapi.server({
  port: PORT,
  host: HOST,
  debug: { request: ['error'] }
});

//app.use(cors(corsOptions));
// Logging
//app.use(morgan('dev'));

server.route(routes)

export const start = async () => {
  
  await server.register(plugins);
  await server.start();

  console.log('Server running on %s', server.info.uri);
  
  server.table().forEach((route) => {
    console.log(route.path);
  });

  return server;
};

export const init = async () => {
  await server.initialize();
  return server;
}

// server.route(ping.getRouteConfig);

// server.route(webclippings.postRouteConfig);

process.on('unhandledRejection', (error) => {
  console.log("unhandledRejection:"+error);
  process.exit(1);
});
