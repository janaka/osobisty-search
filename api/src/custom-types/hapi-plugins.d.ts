import {IHapiWebsocketPluginState} from '../libs/IHapiWebsocketPluginState';
import {IHapiWebsocketPluginSpecificConfiguration} from '../libs/IHapiWebsocketPluginSpecificConfiguration';

declare module '@hapi/hapi' {
  export interface PluginsStates {
    websocket: IHapiWebsocketPluginState;
  }

  export interface PluginSpecificConfiguration {
    websocket: IHapiWebsocketPluginSpecificConfiguration;
  }
}

