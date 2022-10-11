/**
 * 
 * ISC License
 * 
 * Copyright (c) 2015-2016, dwyl ltd
 * 
 * fork: https://github.com/dwyl/hapi-auth-jwt2/blob/master/lib/index.js
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/**
 * The hapi-auth-jwt2 code has been adopted to authenticate websocket connections
 * Specifically to handle y-websocket (of the yjs ecosystem) connection authN/Z
 * We are doing as there's no HAPI websocket auth plugins and hapi-auth-jwt2 plugin doesn't work with websockets
 * Hapi assumption have been removed mostly. 
 * The idea is that we have something that's y-websocket opiniated.
 * use case supported
 * - authN/Z on the websocket connection `upgrade` event
 * future use case
 * - add websocket message level authN/Z support i.e. message payload contains auth status and bearer token. This is to handle scenarios like token expiration or revoke while the ws connection for a doc is still alive. 
 */

'use strict';

import Boom from '@hapi/boom'; // error handling https://github.com/hapijs/boom
import assert from 'assert'; // use assert to check if options are set
//import { ErrorContext } from 'hapi-auth-jwt2';
import JWT, { VerifyOptions } from 'jsonwebtoken'; // https://github.com/docdis/learn-json-web-tokens
import { writeStructsFromTransaction } from 'yjs/dist/src/internals';
import extract, { isValid } from './ws-auth-jwt2-extract.js'; // extract token from Auth Header, URL or Cookie
//import pkg from '../package.json'; // use package name and version rom package.json
//const internals = {}; // see: https://hapi.dev/policies/styleguide/#module-globals

// /**
//  * register registers the name and exposes the implementation of the plugin
//  * see: https://hapi.dev/api/#-serveroptionsplugins for plugin format
//  * @param {Object} server - the hapi server to which we are attaching the plugin
//  * @param {Object} options - any options set during plugin registration
//  * in this case we are not using the options during register but we do later.
//  * @param {Function} next - the callback called once registration succeeds
//  * @returns {Function} next - returns (calls) the callback when complete.
//  */
// exports.plugin = {
//   register: function(server, options) {
//     server.auth.scheme('jwt', internals.implementation); // hapijs.com/api#serverauthapi
//   },
// };

// /**
//  * attributes merely aliases the package.json (re-uses package name & version)
//  * simple example: github.com/hapijs/hapi/blob/master/API.md#serverplugins
//  */
// exports.plugin.pkg = pkg; // hapi requires attributes for a plugin.
// // also see: https://hapi.dev/tutorials/plugins/

// /**
//  * specify peer dependency on hapi, enforced by hapi at runtime
//  */
// exports.plugin.requirements = {
//   hapi: '>=17',
// };

const FIRST_PASS_AUTHENTICATION_FAILED = 'firstPassAuthenticationFailed';

interface ErrorContext {
  /**
   * Boom method to call (eg. unauthorized)
   */
  errorType: string;
  /**
   * message passed into the Boom method call
   */
  message: string;
  /**
   * schema passed into the Boom method call
   */
  scheme: string;
  /**
   * attributes passed into the Boom method call
   */
  attributes?: {
    [key: string]: string;
  };
}


/**
 * checkObjectType returns the class of the object's prototype
 * @param {Object} objectToCheck - the object for which we want to check the type
 * @returns {String} - the string of the object class
 */
const checkObjectType = function (objectToCheck: object): string {
  const toString = Object.prototype.toString;
  return toString.call(objectToCheck);
};

/**
 * isFunction checks if a given value is a function.
 * @param {Object} functionToCheck - the object we want to confirm is a function
 * @returns {Boolean} - true if the functionToCheck is a function. :-)
 */
const isFunction = function (functionToCheck: object): boolean {
  return (
    functionToCheck &&
    (checkObjectType(functionToCheck) === '[object Function]' ||
      checkObjectType(functionToCheck) === '[object AsyncFunction]')
  );
};

const getKeys = async function (decoded: any, options: any) {
  // if keyFunc is function allow dynamic key lookup: https://git.io/vXjvY
  const { key, ...extraInfo } = isFunction(options.key)
    ? await options.key(decoded)
    : { key: options.key };
  const keys = Array.isArray(key) ? key : [key];
  return { keys, extraInfo };
};

export const verifyJwt = function (token: string, keys: any, options: any) {
  let error;
  for (const k of keys) {
    try {
      return JWT.verify(token, k, options.verifyOptions);
    } catch (verify_err) {
      error = verify_err;
    }
  }
  throw error;
};

interface ValidationResult {
  isValid: boolean;
  credentials?: any;
  errorMessage?: string;
}

export const authenticate = async function (token: string, options: any): Promise<ValidationResult> {
  let tokenType = options.tokenType || 'Token'; // see: https://git.io/vXje9
  let decoded;

  if (!token) {
    return buildPromiseValidationResult({
      isValid: false,
      errorMessage: raiseError(
        options,
        'unauthorized',
        'token is null',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      credentials: tokenType,
    })
  }

  // quick check for validity of token format
  if (!isValid(token)) {
    return buildPromiseValidationResult({
      isValid: false,
      errorMessage: raiseError(
        options,
        'unauthorized',
        'Invalid token format',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      credentials: token,
    });
  }
  // verification is done later, but we want to avoid decoding if malformed
  //request.auth.token = token; // keep encoded JWT available in the request
  // otherwise use the same key (String) to validate all JWTs
  try {
    decoded = JWT.decode(token, { complete: options.complete || false });
  } catch (e) {
    // fix for https://github.com/dwyl/hapi-auth-jwt2/issues/328 -
    // JWT.decode() can fail either by throwing an exception or by
    // returning null, so here we just fall through to the following
    // block that tests if decoded is not set, so that we can handle
    // both failure types at once
  }

  if (!decoded) {
    return buildPromiseValidationResult({
      isValid: false,
      errorMessage: raiseError(
        options,
        'unauthorized',
        'Invalid token format',
        tokenType
      ),
      credentials: token,
    });
  }

  if (typeof options.validate === 'function') {
    const { keys, extraInfo } = await getKeys(decoded, options);

    /* istanbul ignore else */
    // if (extraInfo) {
    //   request.plugins[pkg.name] = { extraInfo };
    // }

    let verify_decoded;
    try {
      verify_decoded = verifyJwt(token, keys, options);
    } catch (verify_err: unknown) {
      let err_message =
        (verify_err instanceof Error) && verify_err.message === 'jwt expired'
          ? 'Expired token'
          : 'Invalid token';
      return buildPromiseValidationResult({
        isValid: false,
        errorMessage: raiseError(
          options,
          'unauthorized',
          err_message + " " + verify_err,
          tokenType
        ),
        credentials: token,
      });
    }

    try {
      let {
        isValid,
        credentials,
        response,
        errorMessage,
      } = await options.validate(verify_decoded);
      // if (response !== undefined) {
      //   return { response };
      // }
      if (!isValid) {
        // invalid credentials
        return buildPromiseValidationResult({
          isValid: isValid,
          errorMessage: raiseError(
            options,
            'unauthorized',
            errorMessage || 'Invalid credentials',
            tokenType
          ),
          credentials: decoded,
        });
      }
      // valid key and credentials
      return buildPromiseValidationResult({
        isValid: isValid,
        credentials:
          credentials && typeof credentials === 'object'
            ? credentials
            : decoded,
      });

    } catch (validate_err) {
      return buildPromiseValidationResult({
        isValid: false,
        errorMessage: raiseError(
          options,
          'boomify',
          String(validate_err),
          "jwt"
        ),
        credentials: decoded,
      });
    }
  } 

  // default to invalid credentials
  return buildPromiseValidationResult({
    isValid: false,
    errorMessage: raiseError(
      options,
      'unauthorized',
      'Invalid credentials catch all - fell through all validation options',
      tokenType
    ),
    credentials: decoded,
  });

  // // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
  // try {
  //   // note: at this point, we know options.verify must be non-null,
  //   // because options.validate or options.verify are required to have
  //   // been provided, and if options.validate were non-null, then we
  //   // would have hit the above block and already returned out of this
  //   // function
  //   let { isValid, credentials } = await options.verify(decoded, request);
  //   if (!isValid) {
  //     return {
  //       error: raiseError(
  //         options,
  //         'unauthorized',
  //         'Invalid credentials',
  //         tokenType
  //       ),
  //       payload: { credentials: decoded },
  //     };
  //   }

  //   return {
  //     payload: {
  //       credentials: credentials,
  //       artifacts: {
  //         token,
  //         decoded,
  //       },
  //     },
  //   };
  // } catch (verify_error) {
  //   return {
  //     error: raiseError(options, 'boomify', String(verify_error), "jwt"),
  //     payload: {
  //       credentials: decoded,
  //     },
  //   };
  // }
};


function buildPromiseValidationResult(validationResult: ValidationResult) {

  const p = new Promise<ValidationResult>((resolve, reject) => {
    if (validationResult) {
      resolve(validationResult);
    } else {
      reject("`validationResult` cannot be null or undefined");
    }
  })
  return p;
};


function raiseError(
  options: any,
  errorType: string,
  message: string,
  scheme: string,
  attributes?: any,
  isMissingToken?: boolean
): string {
  let errorContext: ErrorContext = {
    errorType: errorType,
    message: message,
    scheme: scheme,
    attributes: attributes,
  };

  if (isFunction(options.errorFunc)) {
    errorContext = options.errorFunc(errorContext);
  }
  // Since it is clearly specified in the docs that
  // the errorFunc must return an object with keys:
  // errorType and message, we need not worry about
  // errorContext being undefined

  // Boom[errorContext.errorType](
  //   errorContext.message,
  //   errorContext.scheme,
  //   errorContext.attributes
  // );

  return JSON.stringify(errorContext);
};





/**
 * 
 * @param token 
 * @param options 
 * @param request Hapi.Request 
 * @param h Hapi.ResponseToolkit
 * @returns 
 */
const authenticateHapiHttp = async function (token: string, options: any, request: any, h: any) {
  let tokenType = options.tokenType || 'Token'; // see: https://git.io/vXje9
  let decoded;

  if (!token) {
    return {
      error: raiseErrorHttp(
        options,
        request,
        h,
        'unauthorized',
        'token is null',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      payload: {
        credentials: tokenType,
      },
    };
  }

  // quick check for validity of token format
  if (!isValid(token)) {
    return {
      error: raiseErrorHttp(
        options,
        request,
        h,
        'unauthorized',
        'Invalid token format',
        tokenType,
        null, //attributes
        true //flag missing token to HAPI auth framework to allow subsequent auth strategies
      ),
      payload: {
        credentials: token,
      },
    };
  }
  // verification is done later, but we want to avoid decoding if malformed
  request.auth.token = token; // keep encoded JWT available in the request
  // otherwise use the same key (String) to validate all JWTs
  try {
    decoded = JWT.decode(token, { complete: options.complete || false });
  } catch (e) {
    // fix for https://github.com/dwyl/hapi-auth-jwt2/issues/328 -
    // JWT.decode() can fail either by throwing an exception or by
    // returning null, so here we just fall through to the following
    // block that tests if decoded is not set, so that we can handle
    // both failure types at once
  }

  if (!decoded) {
    return {
      error: raiseErrorHttp(
        options,
        request,
        h,
        'unauthorized',
        'Invalid token format',
        tokenType
      ),
      payload: {
        credentials: token,
      },
    };
  }

  if (typeof options.validate === 'function') {
    const { keys, extraInfo } = await getKeys(decoded, options);

    /* istanbul ignore else */
    // if (extraInfo) {
    //   request.plugins[pkg.name] = { extraInfo };
    // }

    let verify_decoded;
    try {
      verify_decoded = verifyJwt(token, keys, options);
    } catch (verify_err: unknown) {
      let err_message =
        (verify_err instanceof Error) && verify_err.message === 'jwt expired'
          ? 'Expired token'
          : 'Invalid token';
      return {
        error: raiseErrorHttp(
          options,
          request,
          h,
          'unauthorized',
          err_message + " " + verify_err,
          tokenType
        ),
        payload: { credentials: token },
      };
    }

    try {
      let {
        isValid,
        credentials,
        response,
        errorMessage,
      } = await options.validate(verify_decoded, request, h);
      if (response !== undefined) {
        return { response };
      }
      if (!isValid) {
        // invalid credentials
        return {
          error: raiseErrorHttp(
            options,
            request,
            h,
            'unauthorized',
            errorMessage || 'Invalid credentials',
            tokenType
          ),
          payload: { credentials: decoded },
        };
      }
      // valid key and credentials
      return {
        payload: {
          credentials:
            credentials && typeof credentials === 'object'
              ? credentials
              : decoded,
          artifacts: {
            token,
            decoded,
          },
        },
      };
    } catch (validate_err) {
      return {
        error: raiseErrorHttp(
          options,
          request,
          h,
          'boomify',
          String(validate_err),
          "jwt"
        ),
        payload: {
          credentials: decoded,
        },
      };
    }
  }
  // see: https://github.com/dwyl/hapi-auth-jwt2/issues/130
  try {
    // note: at this point, we know options.verify must be non-null,
    // because options.validate or options.verify are required to have
    // been provided, and if options.validate were non-null, then we
    // would have hit the above block and already returned out of this
    // function
    let { isValid, credentials } = await options.verify(decoded, request);
    if (!isValid) {
      return {
        error: raiseErrorHttp(
          options,
          request,
          h,
          'unauthorized',
          'Invalid credentials',
          tokenType
        ),
        payload: { credentials: decoded },
      };
    }

    return {
      payload: {
        credentials: credentials,
        artifacts: {
          token,
          decoded,
        },
      },
    };
  } catch (verify_error) {
    return {
      error: raiseErrorHttp(options, request, h, 'boomify', String(verify_error), "jwt"),
      payload: {
        credentials: decoded,
      },
    };
  }
};



// allow custom error raising or default to Boom if no errorFunc is defined
function raiseErrorHttp(
  options: any,
  request: any,
  h: any,
  errorType: string,
  message: string,
  scheme: string,
  attributes?: any,
  isMissingToken?: any
) {
  let errorContext: ErrorContext = {
    errorType: errorType,
    message: message,
    scheme: scheme,
    attributes: attributes,
  };

  if (isFunction(options.errorFunc)) {
    errorContext = options.errorFunc(errorContext, request, h);
  }
  // Since it is clearly specified in the docs that
  // the errorFunc must return an object with keys:
  // errorType and message, we need not worry about
  // errorContext being undefined

  const error = (errorContext: ErrorContext): string => {

    return errorContext.errorType.toLowerCase()
    // Boom[errorContext.errorType](
    //   errorContext.message,
    //   errorContext.scheme,
    //   errorContext.attributes
    // );

  }

  return isMissingToken
    ? Object.assign(error(errorContext), {
      isMissing: true,
    })
    : error(errorContext);
};

const verify = async function (token: string, options: any) {
  //const token = auth.artifacts.token;
  const decoded = JWT.decode(token, {
    complete: options.complete || false,
  });
  const { keys } = await getKeys(decoded, options);
  verifyJwt(token, keys, options);
};

// /**
//  * implementation is the "main" interface to the plugin and contains all the
//  * "implementation details" (methods) such as authenicate, response & raiseError
//  * @param {Object} server - the Hapi.js server object we are attaching the
//  * the hapi-auth-jwt2 plugin to.
//  * @param {Object} options - any configuration options passed in.
//  * @returns {Function} authenicate - we return the authenticate method after
//  * registering the plugin as that's the method that gets called for each route.
//  */
// internals.implementation = function(server, options) {
//   assert(options, 'options are required for jwt auth scheme'); // pre-auth checks
//   assert(
//     options.validate || options.verify,
//     'validate OR verify function is required!'
//   );

//   return {
//     /**
//      * authenticate is the "work horse" of the plugin. it's the method that gets
//      * called every time a route is requested and needs to validate/verify a JWT
//      * @param {Object} request - the standard route handler request object
//      * @param {Object} h - the standard hapi reply interface
//      * @returns {Boolean} if the JWT is valid we return a credentials object
//      * otherwise throw an error to inform the app & client of unauthorized req.
//      */
//     authenticate: async function(request, h) {
//       let token = extract(request, options); // extract token Header/Cookie/Query
//       if (
//         token == null &&
//         options.attemptToExtractTokenInPayload &&
//         request.method.toLowerCase() === 'post'
//       ) {
//         return h.authenticated({
//           credentials: {
//             error: internals.FIRST_PASS_AUTHENTICATION_FAILED,
//           },
//         });
//       }
//       const result = await internals.authenticate(token, options, request, h);
//       if (result.error) {
//         return h.unauthenticated(result.error, result.payload);
//       } else if (result.response) {
//         return h.response(result.response).takeover();
//       } else {
//         return h.authenticated(result.payload);
//       }
//     },
//     /**
//      * payload is an Optional method called if an options.payload is set.
//      * cf. https://hapi.dev/tutorials/auth/
//      * @param {Object} request - the standard route handler request object
//      * @param {Object} h - the standard hapi reply interface ...
//      * after we run the custom options.payloadFunc we h.continue to execute
//      * the next plugin in the list.
//      * @returns {Boolean} true. always return true (unless there's an error...)
//      */
//     payload: async function(request, h) {
//       if (
//         options.attemptToExtractTokenInPayload &&
//         request.auth.credentials.error ===
//           internals.FIRST_PASS_AUTHENTICATION_FAILED
//       ) {
//         const token = extract(request, options);
//         const result = await internals.authenticate(token, options, request, h);
//         if (result && !result.error && result.payload) {
//           request.auth.credentials = result.payload.credentials;
//           request.auth.token = result.payload.token;
//         } else {
//           delete result.error.isMissing;
//           return result.error;
//         }
//       }
//       const payloadFunc = options.payloadFunc;
//       if (payloadFunc && typeof payloadFunc === 'function') {
//         return payloadFunc(request, h);
//       }
//       return h.continue;
//     },

//     /**
//      * response is an Optional method called if an options.responseFunc is set.
//      * @param {Object} request - the standard route handler request object
//      * @param {Object} h - the standard hapi reply interface ...
//      * after we run the custom options.responseFunc we h.continue to execute
//      * the next plugin in the list.
//      * @returns {Boolean} true. always return true (unless there's an error...)
//      */
//     response: function(request, h) {
//       const responseFunc = options.responseFunc;
//       if (responseFunc && typeof responseFunc === 'function') {
//         if (
//           internals.checkObjectType(responseFunc) === '[object AsyncFunction]'
//         ) {
//           return responseFunc(request, h)
//             .then(() => h.continue)
//             .catch(err =>
//               internals.raiseError(options, request, h, 'boomify', err)
//             );
//         }
//         try {
//           // allow responseFunc to decorate or throw
//           responseFunc(request, h);
//         } catch (err) {
//           throw internals.raiseError(options, request, h, 'boomify', err);
//         }
//       }
//       return h.continue;
//     },

//     verify: async function(auth) {
//       const token = auth.artifacts.token;
//       const decoded = JWT.decode(token, {
//         complete: options.complete || false,
//       });
//       const { keys } = await getKeys(decoded, options);
//       verifyJwt(token, keys, options);
//     },
//   };
// };