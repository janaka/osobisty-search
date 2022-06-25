import { Request, ResponseObject } from '@hapi/hapi';
import ws from 'ws';
import { setupWSConnection } from '../libs/yjs-ws-server-utils.js';


export const getRouteConfigYjsWsDocuments: any = {
  method: 'POST',
  path: '/documents/{doc*}',
  options: {
    auth: false, //FIXME: switch auth on. There a problem when we do that, sockets continuously reconnect.
    payload: { output: "data", parse: true, allow: "application/json" },
    plugins: {
      websocket: {
        only: true,
        initially: true,
        connect: ({ ctx, wss, ws, wsf, req, peers }: {
          ctx: Record<string, any>, ws: ws.WebSocket, wss: ws.Server, wsf: any,
          req: Request,
          peers: ws.WebSocket[]
        }): void => {
          console.log("setup websocket conneciton")
          setupWSConnection(ws, req)
        },
      }
    }
  },
  handler: async (req: Request, h: any) => {

    //const { mode } = 
    //console.log(req.plugins.websocket)
    const res: ResponseObject = h.response("okay")
    res.code(200)
    return res
  }
}


// wss.on('connection', setupWSConnection)

// server.on('upgrade', (request: any, socket: any, head: any) => {
//   // You may check auth of request here..
//   // See https://github.com/websockets/ws#client-authentication

//   const handleAuth = (ws: any) => {
//     wss.emit('connection', ws, request)
//   }
//   wss.handleUpgrade(request, socket, head, handleAuth)
// })