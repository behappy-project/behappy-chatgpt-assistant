import moment from 'moment/moment';

const incrQueryCount = async (ctx, next) => {
  if (ctx.user.username !== 'demo') {
    try {
      const year = moment()
        .year();
      const month = moment()
        .month(); // 获取当前月份，从 0 开始计数
      const week = moment()
        .week(); // 获取当前周数，从 1 开始计数
      // 计算当月第一天
      const firstDayOfMonth = moment()
        .year(year)
        .month(month)
        .date(1)
        .startOf('day');
      // 计算当前日期所在周的编号
      const weekNumber = week - firstDayOfMonth.week() + 1;
      // 格式化日期字符串
      const date = moment()
        .format(`YYYYMM${weekNumber}`);
      // 当月查询记录加1
      ctx.redis.hashUser.hincrbySync(ctx.user.username, `record-${date}`);
    } catch (e) {
      ctx.log.error(e.stack);
      return ctx.send('CallServiceError', e.stack);
    }
  }
  await next();
};

/**
 * 试用账户每人每天仅限使用6次
 * @param ctx
 * @param next
 * @returns {Promise<*>}
 */
const filterDemoUser = async (ctx, next) => {
  if (ctx.user.username === 'demo') {
    try {
      const key = `record-${ctx.headers['x-real-ip']}`;
      const qNum = await ctx.redis.hashUser.hgetSync(ctx.user.username, key);
      if (qNum > 6) {
        return ctx.send('LimitQNumError');
      }
      // 查询记录加1
      await ctx.redis.hashUser.hincrbySync(ctx.user.username, key);
    } catch (e) {
      ctx.log.error(e.stack);
      return ctx.send('CallServiceError', e.stack);
    }
  }
  await next();
};

export {
  incrQueryCount,
  filterDemoUser,
};
