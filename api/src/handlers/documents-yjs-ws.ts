import { Request, ResponseObject, server, UserCredentials } from '@hapi/hapi';
import ws from 'ws';
import { IHapiWebsocketPluginState } from '../libs/IHapiWebsocketPluginState.js';
import { setupWSConnection } from '../libs/yjs-ws-server-utils.js';
import { decoding } from 'lib0';
import { doc } from 'lib0/dom.js';
import {URL} from 'node:url'
import extract from '../libs/hapi-auth-jwt2-extract.js'
import { IncomingMessage } from 'node:http';
import hapiAuthJwt2 from 'hapi-auth-jwt2';


export const getRouteConfigYjsWsDocuments: any = {
  method: 'POST',
  path: '/documents/{docname*}',
  options: {
    auth: false, //FIXME: switch auth on. There a problem when we do that, sockets continuously reconnect.
    //auth: {mode: 'required', strategies:['jwt'], payload: false},
    //payload: { output: "stream", parse: true, allow: "application/json" },
    plugins: {
      websocket: {
        only: true,
        initially: false, // inject incoming WebSocket message as a simulated HTTP request
        autoping: 0,
        connect: (state: IHapiWebsocketPluginState): void => {
          
          //if (typeof state.req !== Request) throw new Error("Invalid request type for HAPI")
          const req =  state.req as IncomingMessage

          console.log("Connection event! map connection to YDoc and track")
          
          console.log("headers: ", req.headers)

          let docname: string = "";
          let collectionName: string = "root";
          
          const token: string = extract(req,{customExtractionFunc: (req: IncomingMessage)=>{
            // custome function because we don't have a HAPI Request object available which is the default
            if (!req || !req.url) throw new Error("`state` or `req` or `url` object is undefined/null.")
            console.log("state.req.url=", req.url)
            const parsedUrl = new URL(req.url.toString(), `http://${req.headers.host}`) //state.req.url

            const access_token = parsedUrl.searchParams.get("token")
          
            if (!access_token) throw new Error ("`access_token` is null. Check if the token was sent as a query string param")
            
            return access_token
          }})

          //call verifyjwt and authentication function here

          
          //req.params not avail at this point so manually parse
          if (state.req.url) {
            let url = state.req.url.toString();
            let path = url.split('?')[0];
            let splitPath =  path.split('/');
            docname = splitPath[splitPath.length-1];

            let relpath = path.split("/documents/")[1].split("/"+docname)[0];
            collectionName = relpath.replaceAll("/","__");

            console.log("collectionName:", collectionName);
            console.log("docname:", docname);
          }
        
          setupWSConnection(state.ws, state.req, docname, collectionName)

          state.ws.on('message', (message: ArrayBuffer) => {

                // const decoder = decoding.createDecoder(data)
                // const v1 = decoding.readVarUint(decoder)
                // decoder.
                console.log("ws message received! Payload -->")
                // console.log(v1)
                console.log(message)
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
    console.log("'" + req.path + "' http route handler fired!")
    //req.params.username
    //console.log(req.headers)
    //const headers: Util.Dictionary<string> = req.headers
  
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