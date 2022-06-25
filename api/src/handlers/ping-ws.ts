import { Request, ResponseObject } from '@hapi/hapi';
import ws from 'ws';
import {setupWSConnection} from '../libs/yjs-ws-server-utils.js';

export const getRouteConfigPingWs: any = {
  method: "POST", path: "/pingws",
  options: {
      auth: false,
      payload: { output: "data", parse: true, allow: "application/json" },
      plugins: { websocket: true }
  },
  handler: (req: any, h:any) => {
      let { mode } = req.websocket()
      return { at: "bar", mode: mode, seen: req.payload }
  }
}
