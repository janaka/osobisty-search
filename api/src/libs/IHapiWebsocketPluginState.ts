import ws from 'ws';
import http from 'http';
import { Request } from '@hapi/hapi';

/**
 * @interface IHapiWebsocketPluginState
 * @param {Record<string, any>} ctx - local context
 * @param {ws.WedSockerServer} wss 
 * @param {ws.WebSocket} ws 
 * @param {WSF} wsf: websocket framed
 * @param {(http.IncomingMessage | Request)} req - incoming request. `http.IncomingMessage` is the default type. When using HAPI, `Request` is the HAPI `Request` type
 * @param peers:
 */
export interface IHapiWebsocketPluginState<WSF = any> {
  //mode: 'websocket';
  ctx: Record<string, any>;
  wss: ws.WebSocketServer;
  ws: ws.WebSocket;
  wsf: WSF;
  req: http.IncomingMessage;
  peers: ws.WebSocket[];
  //initially: boolean;
 }