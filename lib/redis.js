const {promisify} = require('util');
const {createClient} = require('redis');

export default class Redis {
  constructor(opts) {
    this.opts = {
      seconds: 0,
      prefix: 'GPT:',
      ...opts,
    };
    this.client = createClient(this.opts);
    this.syncCommand();
  }

  syncCommand() {
    this.ttlSync = promisify(this.client.ttl).bind(this.client);
    this.delSync = promisify(this.client.del).bind(this.client);
    this.hdelSync = promisify(this.client.hdel).bind(this.client);
    this.setnxSync = promisify(this.client.setnx).bind(this.client);
    this.expireSync = promisify(this.client.expire).bind(this.client);
  }

  async getSync(key) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.client.get(key, (err, reply) => {
        if (err) return reject(err);

        try {
          resolve(JSON.parse(reply));
        } catch (e) {
          resolve(reply);
        }
      });
    });
  }

  async setSync(key, value, {merge = false, seconds = this.opts.seconds} = {}) {
    const self = this;

    if (merge) {
      const [old, ttl] = await Promise.all([self.getSync(key), self.ttlSync(key)]);
      if (typeof value === 'object' && typeof old === 'object') {
        value = {...old, ...value};
      }
      seconds = ttl;
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    return new Promise((resolve, reject) => {
      if (seconds > 0) {
        self.client.setex(key, seconds, value, (err, reply) => err ? reject(err) : resolve(reply));
      } else {
        self.client.set(key, value, (err, reply) => err ? reject(err) : resolve(reply));
      }
    });
  }

  async hgetSync(key, field) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.client.hget(key, field, (err, reply) => {
        if (err) return reject(err);

        try {
          resolve(JSON.parse(reply));
        } catch (e) {
          resolve(reply);
        }
      });
    });
  }

  async scan(key) {
    const self = this;
    return new Promise((resolve, reject) => {
      const keys = [];

      function scanRecursive(cursor) {
        self.client.scan(cursor, 'MATCH', key, 'COUNT', '100', (err, res) => {
          if (err) {
            reject(err);
          } else {
            const nextCursor = parseInt(res[0], 10);
            const data = res[1];

            keys.push(...data);

            if (nextCursor === 0) {
              resolve(keys);
            } else {
              scanRecursive(nextCursor);
            }
          }
        });
      }

      scanRecursive(0);
    });
  }

  async hincrbySync(key, field) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.client.hincrby(key, field, 1, (err, reply) => {
        if (err) return reject(err);
        try {
          resolve(JSON.parse(reply));
        } catch (e) {
          resolve(reply);
        }
      });
    });
  }

  async hsetSync(key, field, value, {merge = false, seconds = this.opts.seconds} = {}) {
    const self = this;

    if (merge) {
      const old = await self.hgetSync(key, field);
      if (typeof value === 'object' && typeof old === 'object') {
        value = {...old, ...value};
      }
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    return new Promise((resolve, reject) => {
      self.client.hset(key, field, value, (err, reply) => {
        if (err) return reject(err);

        if (seconds > 0) {
          self.client.expire(key, seconds);
        }
        resolve(reply);
      });
    });
  }

  async hmsetSync(key, fields, seconds = this.opts.seconds) {
    const self = this;

    return new Promise((resolve, reject) => {
      for (let i = 1; i < fields.length; i += 2) {
        if (typeof fields[i] === 'object') fields[i] = JSON.stringify(fields[i]);
      }
      self.client.hmset(key, fields, (err, reply) => {
        if (err) return reject(err);

        if (seconds > 0) {
          self.client.expire(key, seconds);
        }
        resolve(reply);
      });
    });
  }

  async hgetallSync(key) {
    const self = this;

    return new Promise((resolve, reject) => {
      self.client.hgetall(key, (err, reply) => {
        if (err) return reject(err);
        resolve(reply);
      });
    });
  }
}
