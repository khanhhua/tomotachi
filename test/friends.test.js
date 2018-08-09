import supertest from 'supertest';
import chai, { expect } from 'chai';
import spies from 'chai-spies';
chai.use(spies);

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
        .send({
          friends: [
            'a@mail.com'
          ]
        })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/connect')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'a@mail.com',
            'a@mail.com'
          ]
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

describe('As a user, I need an API to retrieve the friends list for an email address.', () => {
  let app;

  describe('Bad Method Calls', () => {
    let getFriendList;

    beforeEach(() => {
      getFriendList = chai.spy(() => {
        return Promise.resolve({ success: true })
      });
      rewireApi.__Rewire__('getFriendList', getFriendList);
      app = makeApp();
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/getFriendList')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      const res = await supertest(app.callback())
        .post('/api/v1/getFriendList')
        .set('Content-Type', 'application/json')
        .send({ email: 'something' })
        .expect(400);

      expectApiResponse(res);
      expect(getFriendList).to.not.have.been.called;
    })
  });

  describe('Get Friend List', () => {
    let getFriendList;

    beforeEach(() => {

    });

    it('must get a list of friends', async () => {
      getFriendList = chai.spy(() => {
        return Promise.resolve({
          success: true,
          friends: [ 'john@mail.com' ],
          count: 1
        })
      });
      rewireApi.__Rewire__('getFriendList', getFriendList);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getFriendList')
        .set('Content-Type', 'application/json')
        .send({ email: 'andy@example.com' })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(res.body.friends).to.exist;
      expect(res.body.count).to.exist;

      expect(getFriendList).to.have.been.called.with.exactly('andy@example.com');
    });

    it('must return error response if such email does not exist', async () => {
      getFriendList = chai.spy(() => {
        const e = new Error('Not found');
        e.status = 404;
        return Promise.reject(e);
      });
      rewireApi.__Rewire__('getFriendList', getFriendList);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getFriendList')
        .set('Content-Type', 'application/json')
        .send({ email: 'andy@example.com' })
        .expect(404);

      expectApiResponse(res);
      expect(getFriendList).to.have.been.called.with.exactly('andy@example.com');
    });
  });
});

describe('As a user, I need an API to retrieve the common friends list between two email addresses', () => {
  let app;

  describe('Bad Method Calls', () => {
    let getCommonFriendList;

    beforeEach(() => {
      getCommonFriendList = chai.spy(() => {
        return Promise.resolve({ success: true })
      });
      rewireApi.__Rewire__('getCommonFriendList', getCommonFriendList);
      app = makeApp();
    });

    it('must reject bad method calls', async () => {
      await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send()
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: []
        })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: [ 'notanemail' ]
        })
        .expect(400);

      await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'john@example.com'
          ]
        })
        .expect(400);

      const res = await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'john@example.com',
            'func@example.com',
            'andy@example.com'
          ]
        })
        .expect(400);

      expectApiResponse(res);
      expect(getCommonFriendList).to.not.have.been.called;
    })
  });

  describe('Get Common Friend List', () => {
    let getCommonFriendList;

    afterEach(() => {
      rewireApi.__ResetDependency__('getCommonFriendList');
    });

    it('must get a list of common friends', async () => {
      getCommonFriendList = chai.spy(() => {
        return Promise.resolve({
          success: true,
          friends: [ 'john@mail.com' ],
          count: 1
        })
      });
      rewireApi.__Rewire__('getCommonFriendList', getCommonFriendList);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'andy@example.com',
            'john@example.com'
          ]
        })
        .expect(200);
      expect(res.body.success).to.be.true;
      expect(res.body.friends).to.exist;
      expect(res.body.count).to.exist;

      expect(getCommonFriendList).to.have.been.called.with.exactly('andy@example.com', 'john@example.com');
    });

    it('must return error response if requestor email does not exist', async () => {
      getCommonFriendList = chai.spy(() => {
        const e = new Error('Bad request');
        e.status = 400;
        return Promise.reject(e);
      });
      rewireApi.__Rewire__('getCommonFriendList', getCommonFriendList);
      app = makeApp();

      const res = await supertest(app.callback())
        .post('/api/v1/getCommonFriendList')
        .set('Content-Type', 'application/json')
        .send({
          friends: [
            'andy@example.com',
            'john@example.com'
          ]
        })
        .expect(400);

      expectApiResponse(res);
      expect(getCommonFriendList).to.have.been.called.with.exactly('andy@example.com', 'john@example.com');
    });
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
