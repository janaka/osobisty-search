import { init } from '../../src/libs/api-server'
import Hapi, { ServerInjectResponse } from '@hapi/hapi';

describe('GET /ping handler', () => {

  let Server: Hapi.Server;

  beforeAll(async () => {
    Server = await init();
  });

  afterAll(async () => {
    await Server.stop();
  });

  test('responds with 200 success for /ping', (done) => {
    const options = {
      method: 'GET',
      url: '/ping'
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

  test('responds with 404 for /pingg', (done) => {
    const options = {
      method: 'GET',
      url: '/pingg'
    };
    Server.inject(options).then((response: ServerInjectResponse) => {

      try {
        expect(response.statusCode).toBe(404);
        expect(response.result).toBeInstanceOf(Object);
        done();
      } catch (error) {
        done(error);
      }
    })
  });
});
