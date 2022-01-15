import Hapi, { Server, Request } from '@hapi/hapi';
import hapiswagger, * as HapiSwagger from 'hapi-swagger';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import H2o2 from '@hapi/h2o2';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import jwksRsa from 'jwks-rsa';

import cors from 'cors';

import dotenv from 'dotenv';

import { frontMatterFieldCollection, serialiseFrontMatter } from './frontmatter.js'

import routes from '../handlers/index.js'

dotenv.config();

// Configuration
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const SSL = process.env.SSL;

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


let server: Server = Hapi.server({
  port: PORT,
  host: HOST,
  routes: {
    cors: {
      origin: ['*'] //TODO: set proper cors policy before going to prod
    }
  },
  debug: { request: ['error'] }
});

//app.use(cors(corsOptions));
// Logging
//app.use(morgan('dev'));

// Autohrization logic
const validateFunc = async (decoded: any) => {

  console.log(decoded)
  const permissions = decoded.permissions;
  var isValid:boolean  = false;
  if (permissions.includes("read:zettleDocuments")) {
    isValid = true;
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
  server.route(routes)
  await server.start();

  authConfig();
  console.log('Server running on %s', server.info.uri);

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
