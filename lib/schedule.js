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
}
