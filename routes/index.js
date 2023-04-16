import Router from 'koa-router';
import image from './chatgpt/image';
import audio from './chatgpt/audio';
import chat from './chatgpt/chat';
import {serverCfg} from '../config';

const router = Router();

const index = router.get('/', async (ctx) => {
  serverCfg.log.debug('success deploy...');
  await ctx.render('index');
});

export {
  index,
  image,
  audio,
  chat,
};
