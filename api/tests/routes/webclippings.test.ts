import { init } from '../../src/libs/api-server'
import Hapi, { ServerInjectResponse } from '@hapi/hapi';

describe('POST/webclipping handler', () => {

  let Server: Hapi.Server;

  beforeAll(async () => {
    Server = await init();
  });

  afterAll(async () => {
    await Server.stop();
  });

  test('responds with 200 success for /webclippings', (done) => {
    
    const options = {
      method: 'POST',
      url: '/webclippings',
      payload: {
        source_content: "some selected text",
        link: "http://www.somelegiturl.com/blablapage"
      }
    };

    Server.inject(options).then((response: ServerInjectResponse) => {

      try {
        expect(response.statusCode).toBe(200);
        expect(response.result).toBeInstanceOf(Object);
        done();
      } catch (error) {
        done(error);
      }
    })
  });

});
