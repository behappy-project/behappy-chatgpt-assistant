import Koa from 'koa';
import koaBody from 'koa-body';
import logger from './lib/log4j';
import {rest} from './lib/rest';
import {resMsg} from './lib/response';
import './lib/utils';
import * as routes from './routes';
import {sysCfg, envCfg} from "./config";
import {openai} from "./lib/openai";

const app = new Koa();

// ctx.log
app.use(logger(app.context, {appName: sysCfg.name}));
// ctx.rest
app.use(rest({
    appName: sysCfg.name,
    apiKey: envCfg.chatGpt.key
}));
// ctx.send
app.use(resMsg());
// ctx.openai
app.use(openai({...envCfg.chatGpt}))

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
const port = Number(process.env.PORT || sysCfg.port);
app.listen(port, '0.0.0.0')
    .on('listening', () => {
        console.log(`Listening on port: ${port}`);
        console.log(`Api prefix: ${sysCfg.apiPrefix}`);
    });
