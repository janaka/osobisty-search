/**
 * 
 * ISC License
 * 
 * Copyright (c) 2015-2016, dwyl ltd
 * 
 * fork: https://github.com/dwyl/hapi-auth-jwt2/blob/master/lib/extract.js
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

'use strict';

import Cookie from 'cookie'; // highly popular decoupled cookie parser

const internals = {}; // see: https://hapi.dev/policies/styleguide/#module-globals

/**
 * customOrDefaultKey is a re-useable method to determing if the developer
 * using the plugin has defined a custom key for extractin the JWT
 * @param {Object} options - the options passed in when registering the plugin. see: https://www.npmjs.com/package/hapi-auth-jwt2#optional-parameters
 * @param {String} key - name of the key e.g `urlKey` see: https://git.io/vXbJN
 * @param {String} _default - the default key used if no custom is defined.
 * @returns {String} key - the custom key or default key.
 */
function customOrDefaultKey(options: { [x: string]: any; }, key: string, _default: string): string {
  return options[key] === false || typeof options[key] === 'string'
    ? options[key]
    : _default;
}

/**
 * isHeadless is a check to see if the header section of the JWT exists
 *
 * @param token - the token extracted from Header/Cookie/query
 * @returns {boolean} true|false - true if JWT is without a header section,
 * false if it is not
 * @example
 * // returns true if the token consist of 3 parts
 * const isheadless = isHeadless(token);
 */
function isHeadless(token: string): boolean {
  return token && token.split('.').length === 2 ? true : false;
};

/**
 * Extract the JWT from URL, Auth Header or Cookie
 * @param {Object} request - standard hapi `Request` type object inclduing headers
 * @param {Object} options - the configuration options defined by the person
 * using the plugin. this includes relevant keys. (see docs https://www.npmjs.com/package/hapi-auth-jwt2#optional-parameters)
 * defaults: cookieKey=token, headerKey=authorization, urlKey=token, payloadKey=token
 * @returns {String} token - the raw JSON Webtoken or `null` if invalid
 */
export default function extract(request: any, options?: any): string {
  // The key holding token value in url or cookie defaults to token
  let auth, token;
  const cookieKey = customOrDefaultKey(options, 'cookieKey', 'token');
  const headerKey = customOrDefaultKey(options, 'headerKey', 'authorization');
  const urlKey = customOrDefaultKey(options, 'urlKey', 'token');
  const payloadKey = customOrDefaultKey(options, 'payloadKey', 'token');
  const pattern = new RegExp(options.tokenType + '\\s+([^$]+)', 'i'); // tokenType (optional defaults to none) - allow custom token type, e.g. Authorization: <tokenType> 12345678.

  if (!options.customExtractionFunc) {
    console.log("no custom function")
    if (urlKey && request.query[urlKey]) {
      // tokens via url: https://github.com/dwyl/hapi-auth-jwt2/issues/19
      auth = request.query[urlKey];
    } else if (headerKey && request.headers[headerKey]) {
      if (typeof options.tokenType === 'string') {
        token = request.headers[headerKey].match(pattern);
        auth = token === null ? null : token[1];
      } else {
        auth = request.headers[headerKey];
      } // JWT tokens in cookie: https://github.com/dwyl/hapi-auth-jwt2/issues/55
    } else if (cookieKey && request.headers.cookie) {
      auth = Cookie.parse(request.headers.cookie)[cookieKey];
    }
    if (payloadKey && request.payload && request.payload[payloadKey]) {
      auth = request.payload[payloadKey];
    }
    // strip pointless "Bearer " label & any whitespace > https://git.io/xP4F
    // re: Snyk reDOS warning - this isn't used for tokens coming as a URL param
  auth = auth ? auth.replace(/Bearer/gi, '').replace(/ /g, '') : null;
  }
  if (!auth && options.customExtractionFunc) {
    auth = options.customExtractionFunc(request);
  }

  // If we are receiving a headerless JWT token let reconstruct it using the custom function
  if (
    options.headless &&
    typeof options.headless === 'object' &&
    isHeadless(auth)
  ) {
    auth = `${Buffer.from(JSON.stringify(options.headless)).toString(
      'base64'
    )}.${auth}`;
  }
  return auth;
};

/**
 * isValid is a basic check for JWT validity of Token format https://git.io/xPBn
 * @param {String} token - the token extracted from Header/Cookie/query
 * @returns {Boolean} true|false - true if JWT is valid. false if invalid.
 */
export function isValid(token: string): boolean {
  return token.split('.').length === 3;
};

