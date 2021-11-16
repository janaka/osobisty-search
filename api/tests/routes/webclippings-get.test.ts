import { init } from '../../src/libs/api-server'
import Hapi, { ServerInjectOptions, ServerInjectResponse } from '@hapi/hapi';
import { ServerResponse } from 'http';

describe('GET/webclipping handler', () => {

  let Server: Hapi.Server;

  beforeAll(async () => {
    Server = await init();
  });

  afterAll(async () => {
    await Server.stop();
  });

  test('responds with 200 success for /webclippings?page_url=', (done) => {
    
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/webclippings?page_url=' + encodeURIComponent("http://www.somelegiturl.com/blablapage"),
    };

    Server.inject(options).then((response: ServerInjectResponse) => {
      
      try {
        expect(response.statusCode).toBe(200);

        const restype = { message: "success", webClippingData: { id: "57004", page_url: "http://www.somelegiturl.com/blablapage", clippings: [{id: "37897", source_content: "some selected text"}] }}  
        expect(response.result).toMatchObject(restype);
        done();
      } catch (error) {
        //console.error(error);
        done(error);
      }
    })
  });

  test('responds with 404 page not found for /webclippings?page_url=', (done) => {
    
    const options: ServerInjectOptions = {
      method: 'GET',
      url: '/webclippings?page_url=' + encodeURIComponent("http://www.somelegiturl.com/some_none_saved_page"),
    };

    Server.inject(options).then((response: ServerInjectResponse) => {
      
      try {
        expect(response.statusCode).toBe(404);

        const restype = { message: "not found" }  
        expect(response.result).toMatchObject(restype);
        done();
      } catch (error) {
        //console.error(error);
        done(error);
      }
    })
  });

});
