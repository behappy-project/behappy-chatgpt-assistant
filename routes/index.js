import Router from 'koa-router';
import image from './chatgpt/image';
import audio from './chatgpt/audio';
import chat from './chatgpt/chat';
import auth from './user/auth';
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

router.get('/register', async (ctx) => {
  serverCfg.log.debug('register...');
  await ctx.render('register');
});

export {
  router,
  image,
  audio,
  chat,
  auth,
};
