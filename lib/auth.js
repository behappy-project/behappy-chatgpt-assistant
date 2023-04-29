const jwt = require('./util/jwt');
const {validatePattern} = require('./util');

module.exports = (opts = {}) => async (ctx, next) => {
  // 排除不需要验证的路径
  if (opts.filter && opts.filter.some(v => validatePattern(ctx.path, v))) {
    await next();
  } else {
    // 认证
    const authorization = ctx.headers.Authorization;
    if (!authorization) {
      await ctx.render('login');
      return;
    }
    const content = jwt.verifyToken(authorization);
    if (content) {
      const password = await ctx.redis.user.getSync(content.username);
      if (!password || password.toString() !== content.password) {
        await ctx.render('login');
        return;
      }
    }
    await ctx.render('login');
  }
};
