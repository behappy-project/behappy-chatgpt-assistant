import * as util from 'util';
import {configure, getLogger} from 'log4js';
import config from '../config/logConfig.json';
import {serverCfg} from '../config';

function getLocalIp() {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  let ip = '';
  for (const dev in ifaces) {
    for (let i = 0; i < ifaces[dev].length; i++) {
      if (!ifaces[dev][i].internal && ifaces[dev][i].family === 'IPv4' && !ifaces[dev][i].address.includes('::') && ifaces[dev][i].address !== '127.0.0.1') {
        ip = ifaces[dev][i].address;
        break;
      }
    }
  }
  return ip;
}

const localIp = getLocalIp();

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
        logger[fn].call(logger, `${opts.appName} ~ ${localIp} ~`, ...args);
      };
    }
  }
}
