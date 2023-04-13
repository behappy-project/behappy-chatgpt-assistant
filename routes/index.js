import Router from 'koa-router';
import models from './chatgpt/models';
import image from './chatgpt/image';
import audio from './chatgpt/audio';
import {sysCfg} from '../config';

const router = Router({prefix: sysCfg.apiPrefix});

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
