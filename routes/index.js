import Router from 'koa-router';
import image from './chatgpt/image';
import audio from './chatgpt/audio';
import chat from './chatgpt/chat';
import user from './chatgpt/user';
import {serverCfg, sysCfg} from '../config';

const router = Router({prefix: sysCfg.prefix});

router.get('/', async (ctx) => {
  serverCfg.log.debug('success deploy...');
  await ctx.render('index');
});

router.get('/login', async (ctx) => {
  serverCfg.log.debug('login...');
  await ctx.render('login');
});

export {
  router,
  image,
  audio,
  chat,
  user,
};
