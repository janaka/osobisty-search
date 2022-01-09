// add import for new handlers
import { ping } from './ping.js'


// add all routeConfigs to array which is used for route registration in main index.js
export default [
  ping.getRouteConfig, 
]