import { Request, ResponseObject} from '@hapi/hapi';
import Boom from '@hapi/boom'
import { REPL_MODE_SLOPPY } from 'repl';

export namespace catchall {
  export const getRouteConfig: any = {
    method: '*',
    path: '/{any*}',
    options: {
      auth: false
    },
    handler: (req: Request, h: any) => {
      // this seems to be the pattern Hapi v17+  
      throw Boom.notFound()
    }
  }
}