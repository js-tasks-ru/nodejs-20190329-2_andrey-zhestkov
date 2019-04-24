const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = [];

router.get('/subscribe', async (ctx, next) => {
  ctx.body = await new Promise((resolve) => {
    subscribers.push(resolve);

    ctx.req.on('close', () => {
      subscribers.splice(subscribers.indexOf(resolve), 1);
    });
  });

  return next();
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  if (!message) {
    ctx.body = 'NO MESSAGE';
    return;
  }

  subscribers.forEach((resolve) => {
    resolve(message);
  });

  subscribers = [];
  ctx.body = 'OK';

  return next();
});

app.use(router.routes());

module.exports = app;
