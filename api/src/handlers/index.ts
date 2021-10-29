// add import for new handlers
import { ping }from './ping.js'
import { webclippings }from './webclipping.js'

// add all routeConfigs to array which is used for route registration in main index.js
export default [ping.getRouteConfig, webclippings.postRouteConfig]