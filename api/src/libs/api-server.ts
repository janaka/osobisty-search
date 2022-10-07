import Hapi, { Server, Request, RouteOptionsCors, ResponseObject } from '@hapi/hapi';
import hapiswagger, * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import H2o2 from '@hapi/h2o2';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import jwksRsa from 'jwks-rsa';
import fs from 'fs';
import HAPIWebSocket from 'hapi-plugin-websocket';

import dotenv from 'dotenv';

import ws from 'ws'


import routes from '../handlers/index.js'
import { ServerOptions } from 'https';




dotenv.config();

// Configuration
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const SSL: boolean = process.env.SSL && (process.env.SSL.toLowerCase() === 'true') ? true : false;

declare global {
  var DEBUG: boolean;
}

globalThis.DEBUG = process.env.DEBUG ? true : false;



// Hapi lifecycle methods 
// https://livebook.manning.com/book/hapi-js-in-action/chapter-5/30

// const client_id: string | undefined = process.env.REACT_APP_CLIENT_ID
// const client_secret = process.env.REACT_APP_CLIENT_SECRET
// const code = process.env.REACT_APP_CODE
// const access_token = process.env.REACT_APP_ACCESS_TOKEN


const version = process.env.npm_package_version;
const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: 'Osobisty API',
    version: version
  }
};

const plugins: Array<Hapi.ServerRegisterPluginObject<any>> = [
  {
    plugin: HAPIWebSocket,
    //options: { noServer: true } if we need to do this to run multiple websocket server, then we need to manually call wss.handleUpgrade somehere tbd to handle the connection upgrade
  },
  {
    plugin: HapiAuthJwt2
  },
  {
    plugin: H2o2
  },
  {
    plugin: Inert
  },
  {
    plugin: Vision
  },
  {
    plugin: HapiSwagger,
    options: swaggerOptions
  },
];

var origins: Array<string> = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(", ") : ['']

var nodeServerOptions: ServerOptions | boolean;
//console.log(process.env)
console.log("CORS orginis config:", origins.toString())

if (process.env.NODE_ENV === "development") {
  if (SSL) {
    //self signed keys for private network
    nodeServerOptions = {
      key: fs.readFileSync(process.cwd() + "/server.key"),
      cert: fs.readFileSync(process.cwd() + "/server.crt")
    };

  } else {
    origins = ['http://localhost:3001']
    nodeServerOptions = false;
  }
} else {
  nodeServerOptions = false;
}

var serverOptionsDebug: false | {
  log?: false | string[] | undefined;
  request?: false | string[] | undefined;
} | undefined

if (globalThis.DEBUG) {
  serverOptionsDebug = {
    request: ['*']
  }
} else {
  serverOptionsDebug = {
    request: false
  }
}

var hapiServerOptions: Hapi.ServerOptions = {
  port: PORT,
  host: process.env.NODE_ENV === "development" ? HOST : "0.0.0.0",
  tls: nodeServerOptions,
  routes: {
    cors: {
      origin: origins,
      credentials: true
    }
  },
  debug: serverOptionsDebug
}
//headers: ["Accept", "Authorization", "Content-Type", "If-None-Match", ], // defaults 
//additionalHeaders: ["Accept-language", "Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Access-Control-Allow-Origin: https://osobisty-search-ui.onrender.com", "Cache-Contorl", "Access-Control-Request-Headers", "Accept-Language", "Accept-Encoding"], 

if (globalThis.DEBUG) console.log("hapiServerOptions:", JSON.stringify(hapiServerOptions).toString())

let server: Server = Hapi.server(hapiServerOptions);
if (globalThis.DEBUG) {
  server.events.on('log', function (event, tags) {
    console.log('log: ', event);
  });
  server.events.on('request', function (request, event, tags) {
    //console.log('Request event fired for: ' + 'channel:' + event.channel + ' ' + request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.path + ' ' + JSON.stringify(request.headers) + ' error: ' + event.error);
    console.log('Request(' + request.info.id + ') event fired for: ' + event);
  });

  server.events.on('response', function (request) {
    //console.log("Response event fired for: " + request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.path + ' ' + JSON.stringify(request.headers));
    console.log("\x1b[35m","Response event fired for ReqID: `" + request.info.id + "`");
  });
}



// Autohrization logic
const validateFunc = async (decoded: any) => {
  // any global validation should go here. 
  // like checking if the user (by some identifier) is known and allowed 
  if (globalThis.DEBUG) {
    console.log("decoded:")
    console.log(decoded)  
  }
  
  decoded.entity = "user"
  const permissions = decoded.permissions;
  const scope = decoded.scope;
  var isValid: boolean = false;

  
  // ideally we want to check permission at the route handler level but need to use a plugin for that. 
  // Only consent scopes are supported sort of OOTB
  if (scope.includes("read:zettleDocuments")) {
    if ((permissions.includes("user") || permissions.includes("machine")) && (permissions.includes("read:zettleDocuments") || permissions.includes("admin:typesense"))) {
      isValid = true;
    }
  }
  return {
    isValid: isValid,
    credentials: decoded,
  };
};


const authConfig = () => {
  server.auth.strategy('jwt', 'jwt', {
    complete: true,
    key: jwksRsa.hapiJwt2KeyAsync({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    verifyOptions: {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    validate: validateFunc,
  });

  server.auth.default('jwt');
}

export const start = async () => {
  authConfig(); // call this before route registration other wise auth specific auth config doesn't know about the auth.strategy
  server.route(routes) // register routes
  await server.start();


  console.log('Server running on %s', server.info.uri);
  console.log('CWD:', process.cwd());
  console.log('registered routes:')
  server.table().forEach((route) => {
    console.log(route.path);
  });

  return server;
};

export const init = async () => {
  await server.register(plugins);
  console.log("plugins registered");

  await server.initialize();
  return server;
}

process.on('unhandledRejection', (error) => {
  console.log("unhandledRejection:" + error);
  process.exit(1);
});
