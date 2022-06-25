import {IHapiWebsocketPluginState} from './IHapiWebsocketPluginState'

export interface IHapiWebsocketPluginSpecificConfiguration {
  only?: boolean;
  initially?: boolean;
  subprotocol?: string;
  connect?: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState
  ) => void;
  disconnect?: (
    this: IHapiWebsocketPluginState['ctx'],
    pluginState: IHapiWebsocketPluginState
  ) => void;
  frame?: boolean;
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
  autoping?: number;
 }