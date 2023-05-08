import Router from 'koa-router';
import {serverCfg, sysCfg} from '../../config';
import {generateToken} from '../../lib/util/jwt';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});

router.post('/login', async (ctx) => {
  const params = ctx.request.body;
  serverCfg.log.debug(__filename, '[login] Request params:', params);
  try {
    const password = await ctx.redis.stringUser.getSync(params.username);
    if (!password || password.toString() !== params.password) {
      return ctx.send('AuthorizationError', '账号或密码错误');
    }
    // 校验是否验证过
    const validate = await ctx.redis.hashUser.hgetSync(params.username, 'validate');
    if (!validate) {
      return ctx.send('AuthorizationError', '该账户未经验证');
    }
    const token = generateToken({
      username: params.username,
      password: params.password,
    });
    ctx.send('Success', token);
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

router.post('/register', async (ctx) => {
  const params = ctx.request.body;
  serverCfg.log.debug(__filename, '[register] Request params:', params);
  try {
    const user = await ctx.redis.stringUser.getSync(params.username);
    if (user) {
      return ctx.send('CallServiceError', '该账户已被注册');
    }
    await ctx.redis.stringUser.setSync(params.username, params.password);
    // 新注册账户为未验证过
    await ctx.redis.hashUser.hsetSync(params.username, 'validate', false);
    ctx.send('Success');
  } catch (e) {
    serverCfg.log.error(e.stack);
    ctx.send('CallServiceError', e.stack);
  }
});

export default router;
