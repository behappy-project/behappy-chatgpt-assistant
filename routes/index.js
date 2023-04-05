import models from './chatgpt/models'
import image from './chatgpt/image'
import Router from "koa-router";

const router = Router();

const index = router.get('/',async (ctx) => {
  ctx.log.debug('success deploy...');
  ctx.send('Success');
});

export {
  index,
  models,
  image
};
