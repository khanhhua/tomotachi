import Router from 'koa-router';
import debug from 'debug';
// import _get from 'lodash.get';
import * as db from './db';
import { format } from './utils';

const dbg = debug('web-api:channels');

async function list(ctx) {
  const { channelId } = ctx.params;
  const { anchor = 0 } = ctx.query;

  try {
    dbg(`Listing messages for channel #${channelId}`);
    const anchorISO = new Date(parseInt(anchor, 10)).toISOString();
    dbg(`Filtering messages by ${anchorISO}`);

    const chunk = await db.ChannelChunk.findOne({ channelId }).lean().exec();
    if (!chunk) {
      ctx.throw(404, 'Channel not found');
    }

    const messages = (chunk.messages || []).filter(({ createdAt }) => {
      return createdAt.toISOString() > anchorISO;
    });

    ctx.body = {
      ok: true,
      messages: messages.map(format),
    };
  } catch (e) {
    ctx.throw(e);
  }
}

// async function view(ctx) {
//   try {
//     const { channelId, messageId } = ctx.params;
//     dbg(`Viewing one message #${channelId}`);
//     const channel = await db.Channel.findById(channelId).lean().exec();
//
//     ctx.body = {
//       ok: true,
//       channel: format(channel),
//     };
//   } catch (e) {
//     ctx.throw(e);
//   }
// }

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

  router.get('/channels/:channelId/messages', list);
  router.post('/channels/:channelId/messages', create);

  dbg('Mounting messages module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
