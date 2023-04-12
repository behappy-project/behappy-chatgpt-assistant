import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import websockify from 'koa-websocket';
import koaViews from 'koa-views';
import * as path from 'path';
import logger from './lib/log4j';
import resMsg from './lib/response';
import * as routes from './routes';
import {sysCfg, envCfg} from './config';
import openai from './lib/openai';
import chat from './lib/chat';
import staticFiles from './lib/static-files';

const app = websockify(new Koa());

// ctx.log
app.ws.use(logger(app.context, {appName: sysCfg.name}));
// ctx.openai
app.ws.use(openai({...envCfg.chatGpt}));
// websocket event
app.ws.use(chat());
// ctx.log
app.use(logger(app.context, {appName: sysCfg.name}));
// ctx.openai
app.use(openai({...envCfg.chatGpt}));
// ctx.send
app.use(resMsg());
// cors
app.use(cors({
  origin: '*',
  credentials: true,
}));

// static file support:
app.use(staticFiles('/static/', `${__dirname}/static`));
app.use(koaViews(path.join(__dirname, 'views/'), {extension: 'html'}));

// body parser
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 20 * 1024 * 1024,
  },
}));

// routes
Object.keys(routes).forEach((k) => {
  app.use(routes[k].routes())
        .use(routes[k].allowedMethods());
});

// error handler
app.on('error', async (err, ctx) => {
  ctx.status = 500;
  ctx.log.error('×××××× System error:', err.stack);
});

// listening
const port = Number(sysCfg.port);
app.listen(port, '0.0.0.0')
    .on('listening', () => {
      console.log(`Listening on port: ${port}`);
      console.log(`Api prefix: ${sysCfg.apiPrefix}`);
    });
