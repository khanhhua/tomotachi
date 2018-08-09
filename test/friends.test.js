import supertest from 'supertest';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
chai.use(spies);

import * as friends from '../src/friends';
import { __RewireAPI__ as rewireApi } from '../src/friends';
import makeApp from '../src/app';

describe('As a user, I need an API to create a friend connection between two email addresses.', () => {
  let app;

  describe('Bad Method Calls', () => {
    beforeEach(() => {
      app = makeApp();
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({ friends: [] })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'notaemail',
            'notevenamail'
          ]
        })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({ friends: [
          'a@mail.com']
        })
        .expect(400);

      const res = await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'a@mail.com',
            'b@mail.com',
            'c@mail.com'
          ]
        })
        .expect(400);

      expectApiResponse(res)
    })
  });

  describe('Connect', () => {
    let connect;

    beforeEach(() => {
      connect = chai.spy(() => {
        debugger
        return Promise.resolve({ success: true })
      });
      rewireApi.__Rewire__('connect', connect);
      app = makeApp();
    });

    it('must connect two friends', async () => {
      const res = await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'joe@mail.com',
            'jane@mail.com'
          ]
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(connect).to.have.been.called.with.exactly('joe@mail.com', 'jane@mail.com');
    })
  });
});

function expectApiResponse(res) {
  expect(res.ok).to.be.false;
  expect(res.body.success).to.be.false;
  expect(res.body.code).to.exist;
  expect(res.body.type).to.exist;
  expect(res.body.message).to.exist;
  // expect(res.body.errors).to.exist;
}
