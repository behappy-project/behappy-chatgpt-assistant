import models from './chatgpt/models'
import chat from './chatgpt/chat'
import Router from "koa-router";
import {sysCfg} from "../config";

const router = Router();

const index = router.get('/', async (ctx) => {
  ctx.log.acc('success deploy...');
  ctx.send('Success');
});
export {
  index,
  models,
  chat
};
