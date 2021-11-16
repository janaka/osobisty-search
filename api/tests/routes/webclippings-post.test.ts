import { init } from '../../src/libs/api-server'
import Hapi, { ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi';
import { ServerResponse } from 'http';

describe('POST/webclipping handler', () => {

  let Server: Hapi.Server;

  beforeAll(async () => {
    Server = await init();
  });

  afterAll(async () => {
    await Server.stop();
  });

  test('responds with 200 success for /webclippings', (done) => {
    
    const options:ServerInjectOptions = {
      method: 'POST',
      url: '/webclippings',
      payload: {
        source_content: "some selected text",
        page_url: "http://www.somelegiturl.com/blablapage"
      }
    };

    Server.inject(options).then((response: ServerInjectResponse) => {
      
      try {
        expect(response.statusCode).toBe(200);

        type restype = { message: "created", webClippingData: { clipId: string, clipPageId: string }}  
        expect(response.result).toMatchObject<restype>({ message: "created", webClippingData: { clipId: "37897", clipPageId: "57004" }} );
        done();
      } catch (error) {
        //console.error(error);
        done(error);
      }
    })
  });

  test('responds with 400 req validation error for /webclippings', (done) => {
    
    const options:ServerInjectOptions = {
      method: 'POST',
      url: '/webclippings',
      payload: {
        source_content: "some selected text",
        page_ur: "http://www.somelegiturl.com/blablapage"
      }
    };

    Server.inject(options).then((response: ServerInjectResponse) => {
      
      try {
        expect(response.statusCode).toBe(400);

        // type restype = { message: "created", webClippingData: { clipId: string, clipPageId: string }}  
        // expect(response.result).toMatchObject<restype>({ message: "created", webClippingData: { clipId: "37897", clipPageId: "57004" }} );
        done();
      } catch (error) {
        //console.error(error);
        done(error);
      }
    })
  });

});
