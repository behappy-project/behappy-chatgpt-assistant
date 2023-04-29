import Router from 'koa-router';
import {serverCfg, sysCfg} from '../../config';
import {generateToken} from '../../lib/util/jwt';

const router = Router({prefix: sysCfg.prefix + sysCfg.apiPrefix});

router.post('/login', async (ctx) => {
  const params = ctx.request.body;
  serverCfg.log.debug(__filename, '[login] Request params:', params);
  try {
    const password = await ctx.redis.user.getSync(params.username);
    if (!password || password.toString() !== params.password) {
      return ctx.send('AuthorizationError', '账号或密码错误');
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

export default router;
