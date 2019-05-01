const Koa = require('koa');
const Router = require('koa-router');

const UserModel = require('./models/User');
const ObjectID = require('mongodb').ObjectID;
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = { error: err.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = await new Promise((resolve) => {
    UserModel.find((err, res) => {
      console.log(res);
      resolve(res);
    });
  });
});

router.get('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  ctx.body = await new Promise((resolve) => {
    if (!ObjectID.isValid(id)) {
      ctx.status = 400;
      resolve({});
    }
    UserModel.findById(id, (err, res) => {
      if (!res) {
        ctx.status = 404;
        resolve({});
      }
      resolve(res);
    });
  });
});

router.patch('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  const {email, displayName} = ctx.request.body;
  ctx.body = await new Promise((resolve) => {
    UserModel.findOne({email}, (err, foundUser) => {
      if (foundUser) {
        ctx.status = 400;
        resolve({
          errors: {
            email: 'Такой email уже существует',
          },
        });
      } else {
        UserModel.findByIdAndUpdate(id, {email, displayName},
            {new: true, runValidators: true}, (err, updatedUser) => {
              if (err) {
                ctx.status = 400;
                resolve({
                  errors: {
                    email: err.errors.email.message,
                  },
                });
              }
              resolve(updatedUser);
            });
      }
    });
  });
});

router.post('/users', async (ctx) => {
  const {email, displayName} = ctx.request.body;
  ctx.body = await new Promise((resolve) => {
    console.log('PROMISE CONSTRUCTOR');
    UserModel.findOne({email}, async (err, foundUser) => {
      if (foundUser) {
        console.log('user found');
        ctx.status = 400;
        resolve({
          errors: {
            email: 'Такой email уже существует',
          },
        });
      } else {
        const user = new UserModel({email, displayName});
        user.save((err) => {
          if (err) {
            ctx.status = 400;
            resolve({
              errors: {
                email: err.errors.email.message,
              },
            });
          }
          resolve(user);
        });
      }
    });
  });
});

router.delete('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  ctx.body = await new Promise((resolve) => {
    UserModel.findByIdAndDelete(id, (err, res) => {
      if (res == null) {
        ctx.status = 404;
        resolve({});
      }
      resolve(res);
    });
  });
});

app.use(router.routes());

module.exports = app;
