import Router from 'koa-router';
import debug from 'debug';
// import _get from 'lodash.get';
import * as db from './db';
import { format } from './utils';

const dbg = debug('web-api:channels');

async function list(ctx) {
  try {
    dbg('Listing all channels');
    const channels = await db.Channel.find({}, null, { limit: 10 }).lean().exec();

    ctx.body = {
      ok: true,
      channels: channels.map(format),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

async function view(ctx) {
  try {
    const { channelId } = ctx.params;
    dbg(`Viewing one channel #${channelId}`);
    const channel = await db.Channel.findById(channelId).lean().exec();

    ctx.body = {
      ok: true,
      channel: format(channel),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

async function create(ctx) {
  const { channelId } = ctx.params;

  try {
    dbg(`Pushing new message to channel #${channelId}`);
    const { text } = ctx.request.body;

    const message = {
      _id: db.objectId(),
      sender: '5bb9dead16b4862b77a1b2db',
      body: text,
      createdAt: new Date(),
    };
    await new Promise((resolve, reject) => {
      dbg('Find and update...');

      db.ChannelChunk.updateOne({ channelId }, { $push: { messages: message } }, { upsert: true }, (err, stats) => {
        if (err) {
          return reject(err);
        }

        const { ok } = stats;
        if (ok) {
          dbg('Done');

          return resolve();
        }

        return reject(new Error('Consistency error'));
      });
    });

    ctx.body = {
      ok: true,
      message: format(message),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

export default (app, baseUrl) => {
  const router = new Router({
    prefix: baseUrl,
  });

  router.get('/channels', list);
  router.get('/channels/:channelId', view);
  router.post('/channels/:channelId/messages', create);

  dbg('Mounting channels module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
