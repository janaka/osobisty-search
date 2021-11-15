// add import for new handlers
import { ping } from './ping.js'
import {postRouteConfigWebclippings} from  './webclippings-post.js'
import {getRouteConfigWebclippings} from './webclippings-get.js'


// add all routeConfigs to array which is used for route registration in main index.js
export default [
  ping.getRouteConfig, 
  postRouteConfigWebclippings, 
  getRouteConfigWebclippings
]