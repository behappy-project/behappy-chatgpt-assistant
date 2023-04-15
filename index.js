import Koa from 'koa';
import koaBody from 'koa-body';
import cors from '@koa/cors';
import koaViews from 'koa-views';
import * as path from 'path';
import * as http from 'http';
import {Server} from 'socket.io';
import resMsg from './lib/response';
import * as routes from './routes';
import {sysCfg, serverCfg} from './config';
import staticFiles from './lib/static-files';
import Chat from './lib/chat';

const app = new Koa();
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
  app.use(koaViews(path.join(__dirname, 'views/'), {extension: 'html'}));
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

const server = http.createServer(app.callback());
const io = new Server(server);
io.on('connection', (socket) => {
  // 监听客户端发送的消息
  socket.on('reqMsgEvent', async (message) => {
    const params = JSON.parse(message);
    if (!params) {
      return;
    }
    // 发送消息到客户端
    await Chat.messageEvent(params, socket);
  });
  socket.on('disconnect', () => {
    console.debug('Client disconnected!');
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
    console.log(`Listening on port: ${port}`);
    console.log(`Api prefix: ${sysCfg.apiPrefix}`);
  });
