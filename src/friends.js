import Router from 'koa-router';
import debug from 'debug';
import _get from 'lodash.get';

const dbg = debug('tomotachi:friends');

export default function(app, baseUrl) {
  const router = new Router({
    prefix: baseUrl
  });

  router.post('/connect', jsonRpc(connect, 'friends.0', 'friends.1'));
  router.post('/getFriendList', jsonRpc(getFriendList));
  router.post('/getCommonFriendList', jsonRpc(getCommonFriendList));

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
  return Promise.resolve({
    success: true
  });
}

async function getFriendList(email) {
  dbg(`Getting friends for email=${email}`);
  return Promise.resolve({
    success: true,
    friends:
      [
        'john@example.com'
      ],
    count: 1
  });
}

async function getCommonFriendList(friendA, friendB) {
  dbg(`Getting the common friends of ${friendA} and ${friendB}`);
  return Promise.resolve({
    success: true,
    friends :
      [
        'common@example.com'
      ],
    count : 1
  });
}
