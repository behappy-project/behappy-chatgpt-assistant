import models from './chatgpt/models'
import chat from './chatgpt/chat'
import Router from "koa-router";
import {sysCfg} from "../config";

const router = Router({prefix: sysCfg.apiPrefix});

const index = router.get('/', async (ctx) => {
  ctx.log.info('success deploy...');
  ctx.send('Success');
});
export {
  index,
  models,
  chat
};
