import models from './chatgpt/models'
import chat from './chatgpt/chat'
import image from './chatgpt/image'
import Router from "koa-router";
import sse from "koa-sse-stream";

const router = Router();

const index = router.get('/',async (ctx) => {
  ctx.log.debug('success deploy...');
  ctx.send('Success');
});

export {
  index,
  models,
  chat,
  image
};
