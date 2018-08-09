import supertest from 'supertest';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
chai.use(spies);

import { __RewireAPI__ as rewireApi } from '../src/subcriptions';
import makeApp from '../src/app';
import * as db from '../src/db';

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

describe('As a user, I need an API to block updates from an email address.', () => {
  let app;

  describe('Bad Method Calls', () => {
    let block;

    beforeEach(() => {
      block = chai.spy(() => {
        return Promise.resolve({ success: true });
      });
      rewireApi.__Rewire__('block', block);
      app = makeApp();
    });

    afterEach(() => {
      rewireApi.__ResetDependency__('block');
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'a' })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({ target: 'b' })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'a', target: 'b' })
        .expect(400);

      const res =await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({ requestor: 'john@mail.com', target: 'notanemail' })
        .expect(400);

      expectApiResponse(res);
      expect(block).to.not.have.been.called;
    })
  });

  describe('Block updates', () => {
    let block;

    afterEach(() => {
      rewireApi.__ResetDependency__('block');
    });

    it('cannot block to oneself', async () => {
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({
          requestor: 'john@example.com',
          target: 'john@example.com'
        })
        .expect(400);
      expect(res.body.success).to.be.false;
    });

    it('must block a target friend', async () => {
      block = chai.spy(() => {
        return Promise.resolve({ success: true });
      });
      rewireApi.__Rewire__('block', block);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/block')
        .set('Content-Type', 'application/json')
        .send({
          requestor: 'joe@mail.com',
          target: 'jane@mail.com'
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(block).to.have.been.called.with.exactly('joe@mail.com', 'jane@mail.com');
    })
  });
});

describe('As a user, I need an API to retrieve all email addresses that can receive updates from an email address.', () => {
  let app;

  describe('Bad Method Calls', () => {
    let getUpdateRecipients;

    beforeEach(() => {
      getUpdateRecipients = chai.spy(() => {
        return Promise.resolve({ success: true });
      });
      rewireApi.__Rewire__('getUpdateRecipients', getUpdateRecipients);
      app = makeApp();
    });

    afterEach(() => {
      rewireApi.__ResetDependency__('getUpdateRecipients');
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({ sender: 'a' })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({ sender: 'a', text: 'b' })
        .expect(400);

      const res = await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({ sender: 'john@mail.com', text: 'This text is invalid#' })
        .expect(400);

      expectApiResponse(res);
      expect(getUpdateRecipients).to.not.have.been.called;
    })
  });

  describe('Block updates', () => {
    let getUpdateRecipients;

    afterEach(() => {
      rewireApi.__ResetDependency__('getUpdateRecipients');
      rewireApi.__ResetDependency__('db');
    });

    it('cannot getUpdateRecipients for non-existing sender', async () => {
      getUpdateRecipients = chai.spy(() => {
        const e = new Error('Sender not found');
        e.status = 400;

        throw e;
      });
      rewireApi.__Rewire__('getUpdateRecipients', getUpdateRecipients);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({
          sender: 'john@example.com',
          text: 'Hello world!'
        })
        .expect(400);
      expectApiResponse(res);
      expect(getUpdateRecipients).to.have.been.called.with.exactly('john@example.com', 'Hello world!');
    });

    it('must getUpdateRecipients for a given sender and text', async () => {
      let getCombinedRecipientsList = chai.spy(() => Promise.resolve([
        'sam@example.com',
        'func@example.com'
      ]));

      rewireApi.__Rewire__('db', {
        getCombinedRecipientsList: getCombinedRecipientsList
      });

      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({
          sender: 'john@example.com',
          text: 'Hello world!'
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(res.body.recipients).to.be.deep.equal([
        'sam@example.com',
        'func@example.com'
      ]);

      expect(getCombinedRecipientsList).to.have.been.called.with.exactly('john@example.com', []);
    });

    it('must getUpdateRecipients for a given sender and text with mentionees', async () => {
      let getCombinedRecipientsList = chai.spy(() => Promise.resolve([
        'sam@example.com',
        'func@example.com'
      ]));

      rewireApi.__Rewire__('db', {
        getCombinedRecipientsList: getCombinedRecipientsList
      });

      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getUpdateRecipients')
        .set('Content-Type', 'application/json')
        .send({
          sender: 'john@example.com',
          text: 'Hello world! jane@example.com'
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(res.body.recipients).to.be.deep.equal([
        'sam@example.com',
        'func@example.com'
      ]);

      expect(getCombinedRecipientsList).to.have.been.called.with.exactly('john@example.com', ['jane@example.com']);
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
