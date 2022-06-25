import ws from 'ws';
import http from 'http';
import { Request, ResponseObject } from '@hapi/hapi';

export interface IHapiWebsocketPluginState<WSF = any> {
  mode: 'websocket';
  ctx: Record<string, any>;
  wss: ws.Server;
  ws: ws.WebSocket;
  wsf: WSF;
  //req: http.IncomingMessage;
  req: Request
  peers: ws.WebSocket[];
  initially: boolean;
 }