import jwt from 'jsonwebtoken';
import Router from 'koa-router';
import debug from 'debug';
// import _get from 'lodash.get';
import * as db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 's@cret';
const dbg = debug('web-api:auth');

async function authenticate(ctx) {
  const { body: payload } = ctx.request;
  const { email } = payload;

  try {
    dbg(`Finding user with email: ${email}`);
    const user = await db.User.findOne({ email }).exec();

    if (!user) {
      ctx.throw(403, 'Not authorized');
    }

    const authToken = jwt.sign(
      {
        sub: user.id,
        username: user.username,
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1 day',
      });

    ctx.body = {
      ok: true,
      authToken,
      user: {
        id: user.id,
        username: user.username,
        channels: user.channels,
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

  router.post('/auth', authenticate);

  dbg('Mounting auth module...');
  app.use(router.routes());
  app.use(router.allowedMethods());
};
