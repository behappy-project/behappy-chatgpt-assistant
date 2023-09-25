import schedule from 'node-schedule';
import {serverCfg} from '../config';

export class ScheduleJob {
  constructor(ctx) {
    this.ctx = ctx;
    this.initJob().then(() => serverCfg.log.debug('Initializing scheduleJob.'));
  }

  static getInstance(ctx) {
    if (!ScheduleJob.instance) {
      ScheduleJob.instance = new ScheduleJob(ctx);
    }
    return ScheduleJob.instance;
  }

  async initJob() {
    schedule.scheduleJob('0 0 * * 0', () => this.delUnusedUser());
    // 每天12点flush demo账户使用次数
    schedule.scheduleJob('0 0 0 * * ?', () => this.flushDemoUser());
  }

  async delUnusedUser() {
    const hashVals = await this.ctx.redis.hashUser.scan('GPT-USER:HASH:*');
    for (const hashKey of hashVals) {
      const username = hashKey.split(':')[2];
      const validate = await this.ctx.redis.hashUser.hgetSync(username, 'validate');
      if (validate) {
        continue;
      }
      // 删除unused user
      await this.ctx.redis.hashUser.delSync(username);
      await this.ctx.redis.stringUser.delSync(username);
    }
  }

  async flushDemoUser() {
    await this.ctx.redis.hashUser.hmget
    const hashVals = await this.ctx.redis.hashUser.hgetallSync('demo');
    for (const hashKey in hashVals) {
      if (hashKey === 'validate') continue;
      await this.ctx.redis.hashUser.hsetSync('demo', hashKey, 0);
    }
  }
}
