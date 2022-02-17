import Hapi, { Server, Request, RouteOptionsCors } from '@hapi/hapi';
import hapiswagger, * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import H2o2 from '@hapi/h2o2';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import jwksRsa from 'jwks-rsa';
import fs from 'fs';
import os from 'os';

import dotenv from 'dotenv';

import { frontMatterFieldCollection, serialiseFrontMatter } from './frontmatter.js'

import routes from '../handlers/index.js'
import { ServerOptions } from 'https';
import { dirname } from 'path';

dotenv.config();

// Configuration
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const SSL: boolean = process.env.SSL && (process.env.SSL.toLowerCase() === 'true') ? true : false;
const DEBUG: boolean = process.env.DEBUG ? true : false;



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

if (DEBUG) {
  serverOptionsDebug = {
    request: ['request']
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
      headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
      additionalHeaders: ["Accept-language", "Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Access-Control-Allow-Origin: https://osobisty-search-ui.onrender.com", "Cache-Control", "Access-Control-Request-Headers", "Accept-Language", "Accept-Encoding", "Origin"], // defaults ['Accept', 'Authorization', 'Content-Type', 'If-None-Match']
    }
  },
  debug: serverOptionsDebug
}

      //headers: [,"Accept", "Authorization", "Content-Type", "If-None-Match", ],
      //additionalHeaders: ["Accept-language", "Access-Control-Allow-Headers", "Access-Control-Allow-Origin", "Access-Control-Allow-Origin: https://osobisty-search-ui.onrender.com", "Cache-Contorl", "Access-Control-Request-Headers", "Accept-Language", "Accept-Encoding"], // defaults ['Accept', 'Authorization', 'Content-Type', 'If-None-Match']

console.log("hapiServerOptions:", JSON.stringify(hapiServerOptions).toString())

let server: Server = Hapi.server(hapiServerOptions);

// Autohrization logic
const validateFunc = async (decoded: any) => {
  // any global validation should go here. 
  // like checking if the user (by some identifier) is known and allowed 
  console.log("decoded:")
  console.log(decoded)
  decoded.entity = "user"
  const permissions = decoded.permissions;
  const scope = decoded.scope;
  var isValid: boolean = true;

  // TODO: check user ID is authorized here.

  // ideally we want to check permission at the route level but need to use plugin for that
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

// server.route(ping.getRouteConfig);

// server.route(webclippings.postRouteConfig);

process.on('unhandledRejection', (error) => {
  console.log("unhandledRejection:" + error);
  process.exit(1);
});
