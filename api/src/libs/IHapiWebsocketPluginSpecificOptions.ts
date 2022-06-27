import {IHapiWebsocketPluginState} from './IHapiWebsocketPluginState'

// defaults: https://github.com/rse/hapi-plugin-websocket/blob/84a11a6fb6dde3e0cc3d2ffb36cbf0386624927e/hapi-plugin-websocket.js#L63

export interface IHapiWebsocketPluginSpecificOptions {
  only?: boolean; //default false
  initially?: boolean; //default false
  subprotocol?: string; //default null
  connect?: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState
  ) => void;
  disconnect?: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState
  ) => void;
  frame?: boolean; // default false
  frameEncoding?: 'json' | string;
  frameRequest?: 'REQUEST' | string;
  frameResponse?: 'RESPONSE' | string;
  error?: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState,
    error: Error
  ) => void;
  // request:       function (ctx, request, h) { return h.continue },
  // response:      function (ctx, request, h) { return h.continue },
  frameMessage: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState,
    fame: any
  ) => void;
  autoping?: number; // default 0
 }