import * as util from 'util';
import {configure, getLogger} from 'log4js';
import config from '../config/logConfig.json';

export default class Logger {
  constructor(opts) {
    const functions = ['acc', 'info', 'debug', 'warn', 'error'];
    configure(config);
    for (const fn of functions) {
      const logger = getLogger(fn);
      Logger.prototype[fn] = function (...args) {
        for (const [i, arg] of args.entries()) {
          if (typeof arg !== 'object') continue;
          args[i] = util.inspect(arg, {depth: Infinity});
        }
        logger[fn].call(logger, `${opts.appName} ~`, ...args);
      };
    }
  }
}
