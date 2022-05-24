#!/usr/bin/env node

 import {WebSocketServer} from 'ws'
 import http from 'http'
 import {setupWSConnection} from './utils.js';

 const wss = new WebSocketServer({ noServer: true })
 
 
 const host = process.env.HOST || 'localhost'
 const port = process.env.PORT || 1234
 
 const server = http.createServer((request:any, response:any) => {
   response.writeHead(200, { 'Content-Type': 'text/plain' })
   response.end('okay')
 })
 
 wss.on('connection', setupWSConnection)
 
 server.on('upgrade', (request:any, socket:any, head:any) => {
   // You may check auth of request here..
   // See https://github.com/websockets/ws#client-authentication
   /**
    * @param {any} ws
    */
   const handleAuth = (ws:any) => {
     wss.emit('connection', ws, request)
   }
   wss.handleUpgrade(request, socket, head, handleAuth)
 })
 
 server.listen(port, () => {
   console.log(`running at '${host}' on port ${port}`)
 })