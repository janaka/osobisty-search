import {IHapiWebsocketPluginState} from '../libs/IHapiWebsocketPluginState';
import {IHapiWebsocketPluginSpecificConfiguration} from '../libs/IHapiWebsocketPluginSpecificOptions';

declare module '@hapi/hapi' {
  export interface PluginsStates {
    websocket: IHapiWebsocketPluginState;
  }

  export interface PluginSpecificOptions {
    websocket: IHapiWebsocketPluginSpecificOptions;
  }
}

