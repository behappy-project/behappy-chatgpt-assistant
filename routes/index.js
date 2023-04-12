import Router from 'koa-router';
import models from './chatgpt/models';
import image from './chatgpt/image';
import audio from './chatgpt/audio';

const router = Router();

const index = router.get('/', async (ctx) => {
  ctx.log.debug('success deploy...');
  await ctx.render('index');
});

export {
  index,
  models,
  image,
  audio,
};
