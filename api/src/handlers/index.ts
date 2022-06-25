// add import for new handlers
import { ping } from './ping.js'
import {postRouteConfigWebclippings} from  './webclippings-post.js'
import {getRouteConfigWebclippings} from './webclippings-get.js'
import { getRouteConfigTypesenseApi } from './typesense-api-proxy.js'
import { catchall } from './catch-all.js'
import { getRouteConfigYjsWsDocuments } from './documents-yjs-ws.js'
import { getRouteConfigPingWs } from './ping-ws.js'


// add all routeConfigs to array which is used for route registration in main index.js
export default [
  ping.getRouteConfig, 
  postRouteConfigWebclippings, 
  getRouteConfigWebclippings,
  getRouteConfigTypesenseApi,
  catchall.getRouteConfig,
  getRouteConfigYjsWsDocuments,
  getRouteConfigPingWs
]