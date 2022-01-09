import { Request, ResponseObject } from '@hapi/hapi';


export namespace ping {
  export const getRouteConfig: any = {
    method: 'GET',
    path: '/ping',
    handler: (req: Request, h: any) => {
      const res: ResponseObject = h.response({ message: "hello world!" })
      res.code(200)
      return res
    }
  }
}