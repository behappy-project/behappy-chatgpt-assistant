import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import koaViews from 'koa-views';
import * as path from 'path';
import resMsg from './lib/response';
import * as routes from './routes';
import {sysCfg, serverCfg} from './config';
import staticFiles from './lib/static-files';

const app = new Koa();
app.use(async (ctx, next) => {
  serverCfg.acc(ctx);
  await next();
});
// ctx.send
app.use(resMsg());
// cors
app.use(cors({
  origin: '*',
  credentials: true,
}));

// 生产环境静态文件放在nginx下
if (sysCfg.nodeEnv !== 'production') {
  app.use(staticFiles(`${sysCfg.apiPrefix}/static/`, `${__dirname}/static`));
  app.use(koaViews(path.join(__dirname, 'static/'), {extension: 'html'}));
}

// body parser
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 20 * 1024 * 1024,
  },
}));

// routes
Object.keys(routes)
  .forEach((k) => {
    app.use(routes[k].routes())
      .use(routes[k].allowedMethods());
  });
// error handler
app.on('error', async (err, ctx) => {
  ctx.status = 500;
  serverCfg.log.error('×××××× System error:', err.stack);
});
// listening
const port = Number(sysCfg.port);
app.listen(port, '0.0.0.0')
  .on('listening', () => {
    serverCfg.log.info(`Listening on port: ${port}`);
    serverCfg.log.info(`Api Prefix: ${sysCfg.apiPrefix}`);
  });
