import Router from 'koa-router';
import debug from 'debug';
import _get from 'lodash.get';
import * as db from './db';

const dbg = debug('tomotachi:friends');

export default function(app, baseUrl) {
  const router = new Router({
    prefix: baseUrl
  });

  router.post('/subscribe', jsonRpc(subscribe, 'requestor', 'target'));
  router.post('/block', jsonRpc(block, 'requestor', 'target'));
  router.post('/getUpdateRecipients', jsonRpc(getUpdateRecipients, 'sender', 'text'));

  dbg('Mounting subscriptions module...');
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

async function subscribe(requestor, target) {
  if (requestor === target) {
    const e = new Error('Cannot subscribe to oneself');
    e.status = 400;
    throw e;
  }

  dbg(`Checking if friends actually exists`);
  const exists = await Promise.all([
    await db.userExistsByEmail(requestor),
    await db.userExistsByEmail(target),
  ]).then(([...exists]) => {
    return exists.every(Boolean);
  });

  if (!exists) {
    dbg('One of requestor/target email does not exist');

    const e = new Error('Bad request');
    e.status = 400;

    throw e;
  }

  dbg(`Subscribing ${requestor} to friend ${target}`);

  await db.makeSubscription(requestor, target);

  return {
    success: true
  };
}

async function block(requestor, target) {
  return {
    success: true
  };
}

async function getUpdateRecipients(sender, text) {
  return {
    success: true,
    recipients: [
      'lisa@example.com',
      'kate@example.com'
    ]
  };
}