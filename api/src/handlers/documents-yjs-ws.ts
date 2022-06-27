import { Request, ResponseObject, UserCredentials, Util } from '@hapi/hapi';
import ws from 'ws';
import { IHapiWebsocketPluginState } from '../libs/IHapiWebsocketPluginState.js';
import { setupWSConnection } from '../libs/yjs-ws-server-utils.js';
import { decoding } from 'lib0';


export const getRouteConfigYjsWsDocuments: any = {
  method: 'POST',
  path: '/documents/{doc*}',
  options: {
    auth: false, //FIXME: switch auth on. There a problem when we do that, sockets continuously reconnect.
    //payload: { output: "stream", parse: true, allow: "application/json" },
    plugins: {
      websocket: {
        only: true,
        initially: false,
        autoping: 0,
        connect: (state: IHapiWebsocketPluginState): void => {
          console.log("setup websocket conneciton")
          setupWSConnection(state.ws, state.req)



          state.ws.on('message', (data: ArrayBuffer, isBinary)=>{
            console.log("ws message received! Payload -->")
            console.log(data)
                // const decoder = decoding.createDecoder(data.)
                // decoding.readVarUint(decoder)
          })

          state.ws.on('ping', (data)=>{
            console.log("ws ping received! Payload -->")
            console.log(data)
          })

          state.ws.on('pong', (data)=>{
            console.log("ws pong received!")
            console.log(data)

          })

          state.ws.on('unexpected-response', (req, res) =>{
            console.log("unexpected response")
          })

          state.ws.on('error', (error) =>{
            console.log("error: ", error)
          })

        },
        error: (state: IHapiWebsocketPluginState, error:Error): void => {
          console.log("error: ", error)
        }
      }
    }
  },
  handler: async (req: Request, h: any) => {
    console.log("'" + req.path + "' route handler fired! req payload -->")
    
    //console.log(req.raw.req)

    const headers: Util.Dictionary<string> = req.headers
headers

    const res: ResponseObject = h.response
    //res.code(200)
    
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