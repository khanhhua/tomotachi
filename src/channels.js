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
  const { channelId } = ctx.params;
  const { anchor = 0 } = ctx.query;

  try {
    dbg(`Viewing one channel #${channelId}`);
    const channel = await db.Channel.findById(channelId).lean().exec();
    const chunk = await db.ChannelChunk.findOne({ channelId }).lean().exec();

    const anchorISO = new Date(parseInt(anchor, 10)).toISOString();
    dbg(`Filtering messages by ${anchorISO}`);
    const messages = (chunk.messages || []).filter(({ createdAt }) => {
      return createdAt.toISOString() > anchorISO;
    });

    ctx.body = {
      ok: true,
      channel: {
        ...format(channel),
        messages: messages.map(format),
      },
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

  dbg('Mounting channels module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
