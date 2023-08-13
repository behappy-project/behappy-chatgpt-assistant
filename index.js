import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import koaViews from 'koa-views';
import * as path from 'path';
import * as http from 'http';
import {Server} from 'socket.io';
import resMsg from './lib/response';
import auth from './lib/auth';
import * as routes from './routes';
import {sysCfg, serverCfg, redisCfg} from './config';
import staticFiles from './lib/static-files';
import Redis from './lib/redis';
import {ScheduleJob} from './lib/schedule';

const app = new Koa();

// ctx.redis
app.context.redis = redisCfg.reduce((s, v) => {
  s[v.key] = new Redis(v.opts);
  return s;
},
{});

// ctx.send
app.use(resMsg());
// cors
app.use(cors({
  origin: '*',
  credentials: true,
}));

// 生产环境静态文件放在nginx下
if (sysCfg.nodeEnv !== 'production') {
  app.use(staticFiles(`${sysCfg.prefix}/static/`, `${__dirname}/static`));
  app.use(koaViews(path.join(__dirname, 'static/'), {extension: 'html'}));
}

// body parser
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 20 * 1024 * 1024,
  },
}));

// 校验token
app.use(auth({
  filter: [
    '\\.(js|css|jpg|ico)$',
    `^${sysCfg.prefix}${sysCfg.apiPrefix}/login$`,
    `^${sysCfg.prefix}${sysCfg.apiPrefix}/register$`,
    `^${sysCfg.prefix}/login$`,
    `^${sysCfg.prefix}/register$`,
    `^${sysCfg.prefix}$`,
  ],
}));

// routes
Object.keys(routes)
  .forEach((k) => {
    app.use(routes[k].routes())
      .use(routes[k].allowedMethods());
  });

const server = http.createServer(app.callback());
const io = new Server(server, {
  transports: ['websocket'],
  allowUpgrades: false,
  pingTimeout: 60000,
});
io.on('connection', (socket) => {
  // 监听客户端发送的消息
  socket.on('reqMsgEvent', async (message) => {
    const params = JSON.parse(message);
    if (!params) {
      return;
    }
    serverCfg.log.debug('[messageEvent] Request params:', params);
    // 发送消息到客户端
    await Chat.messageEvent(params, socket);
  });
  socket.on('disconnect', (reason) => {
    serverCfg.log.error('Client disconnected! ', reason);
  });
});
// error handler
server.on('error', async (err, ctx) => {
  ctx.status = 500;
  serverCfg.log.error('×××××× System error:', err.stack);
});
// listening
const port = Number(sysCfg.port);
server.listen(port, '0.0.0.0')
  .on('listening', () => {
    serverCfg.log.info(`Listening on port: ${port}`);
    serverCfg.log.info(`Api Prefix: ${sysCfg.prefix}`);
  });
// schedule
ScheduleJob.getInstance(app.context);
