import supertest from 'supertest';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
chai.use(spies);

import { __RewireAPI__ as rewireApi } from '../src/subcriptions';
import makeApp from '../src/app';

describe('As a user, I need an API to subscribe to updates from an email address.', () => {
  let app;

  describe('Bad Method Calls', () => {
    let subscribe;

    beforeEach(() => {
      subscribe = chai.spy(() => {
        return Promise.resolve({ success: true });
      });
      rewireApi.__Rewire__('subscribe', subscribe);
      app = makeApp();
    });

    afterEach(() => {
      rewireApi.__ResetDependency__('subscribe');
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'a' })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({ target: 'b' })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'a', target: 'b' })
        .expect(400);

      const res =await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'john@mail.com', target: 'notanemail' })
        .expect(400);

      expectApiResponse(res);
      expect(subscribe).to.not.have.been.called;
    })
  });

  describe('Make subscription', () => {
    let subscribe;

    afterEach(() => {
      rewireApi.__ResetDependency__('subscribe');
    });

    it('cannot subscribe to oneself', async () => {
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({
          requestor: 'john@example.com',
          target: 'john@example.com'
        })
        .expect(400);
      expect(res.body.success).to.be.false;
    });

    it('must subscribe to a friend', async () => {
      subscribe = chai.spy(() => {
        return Promise.resolve({ success: true });
      });
      rewireApi.__Rewire__('subscribe', subscribe);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/subscribe')
        .set('Content-Type', 'application/json')
        .send({
          requestor: 'joe@mail.com',
          target: 'jane@mail.com'
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(subscribe).to.have.been.called.with.exactly('joe@mail.com', 'jane@mail.com');
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
