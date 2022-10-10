import { Request, ResponseObject } from '@hapi/hapi';

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
