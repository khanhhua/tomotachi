import Router from 'koa-router';
import debug from 'debug';
import _get from 'lodash.get';
import * as db from './db';

const dbg = debug('tomotachi:friends');

export default function(app, baseUrl) {
  const router = new Router({
    prefix: baseUrl
  });

  router.post('/connect', jsonRpc(connect, 'friends.0', 'friends.1'));
  router.post('/getFriendList', jsonRpc(getFriendList, 'email'));
  router.post('/getCommonFriendList', jsonRpc(getCommonFriendList, 'friends.0', 'friends.1'));

  dbg('Mounting friends module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
}

function jsonRpc(fn, ...params) {
  return async function (ctx) {
    const { body } = ctx.request;
    dbg('Raw rpc argument object:', body);

    const paramValues = params.map(keyPath => _get(body, keyPath));
    dbg('Parsed param values:', paramValues);

    switch (paramValues.length) {
      case 0:
        ctx.body = await fn();
        break;
      case 1:
        ctx.body = await fn(paramValues[0]);
        break;
      case 2:
        ctx.body = await fn(paramValues[0], paramValues[1]);
        break;
      case 3:
        ctx.body = await fn(paramValues[0], paramValues[1], paramValues[2]);
        break;
      default:
        ctx.body = await fn.apply(paramValues);
        break;
    }
  };
}

async function connect(friendA, friendB) {
  dbg(`Connecting friends ${friendA} and ${friendB}`);

  const result = await db.connectFriends([friendA, friendB]);

  return Promise.resolve({
    success: result
  });
}

async function getFriendList(email) {
  dbg(`Getting friends for email=${email}`);

  const friends = await db.findFriendsByEmail(email);

  return Promise.resolve({
    success: true,
    friends,
    count: friends.length
  });
}

async function getCommonFriendList(friendA, friendB) {
  dbg(`Checking if friends actually exists`);
  const exists = await Promise.all([
    await db.userExistsByEmail(friendA),
    await db.userExistsByEmail(friendB),
  ]).then(([...exists]) => {
    return exists.every(Boolean);
  });

  if (!exists) {
    dbg('One of requestor email does not exist');

    const e = new Error('Bad request');
    e.status = 400;

    throw e;
  }

  dbg(`Getting the common friends of ${friendA} and ${friendB}`);
  const friends = await db.findCommonFriends([friendA, friendB]);

  return {
    success: true,
    friends,
    count: friends.length
  };
}
