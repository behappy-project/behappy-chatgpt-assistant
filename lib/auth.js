const jwt = require('./util/jwt');
const {validatePattern} = require('./util');

module.exports = (opts = {}) => async (ctx, next) => {
  // 排除不需要验证的路径
  if (opts.filter && opts.filter.some(v => validatePattern(ctx.path, v))) {
    await next();
  } else {
    // 认证
    const authorization = ctx.headers.Authorization || ctx.headers.authorization;
    if (!authorization) {
      return ctx.send('AuthorizationError', '请先进行登录！');
    }
    const content = jwt.verifyToken(authorization);
    if (content) {
      // 校验密码
      const password = await ctx.redis.stringUser.getSync(content.username);
      if (!password || password.toString() !== content.password) {
        return ctx.send('AuthorizationError', '账号或密码错误！');
      }
      // 校验是否验证过
      const validate = await ctx.redis.hashUser.hgetSync(content.username, 'validate');
      if (!validate) {
        return ctx.send('AuthorizationError', '该账户未经验证！');
      }
      ctx.user = content;
    } else {
      // token解析错误
      return ctx.send('TokenParseError', '令牌解析错误！');
    }
    await next();
  }
};
