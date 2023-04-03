const util = require('util')
const {configure, getLogger} = require('log4js')
const config = require('../config/logConfig.json')

const localIp = getLocalIp()
function getLocalIp() {
    const os = require('os');
    const ifaces = os.networkInterfaces();
    let ip = '';
    for (let dev in ifaces) {
        for (let i = 0; i < ifaces[dev].length; i++) {
            if (!ifaces[dev][i].internal && ifaces[dev][i].family === 'IPv4' && !ifaces[dev][i].address.includes('::') && ifaces[dev][i].address !== '127.0.0.1') {
                ip = ifaces[dev][i].address;
                break;
            }
        }
    }
    return ip;
}

class Logger {
    constructor(ctx, opts) {
        const functions = ['acc', 'biz', 'debug', 'warn', 'error'];
        configure(config);
        for (const fn of functions) {
            const logger = getLogger(fn);
            Logger.prototype[fn] = function(...args) {
                for (const [i, arg] of args.entries()) {
                    if (typeof arg !== "object") continue;
                    args[i] = util.inspect(arg, {depth: Infinity});
                }
                logger[fn].call(logger, `${opts.appName} ~ ${localIp} ~`, ...args);
            };
        }
        ctx.log = this;
    }
}

module.exports = (context,opts) => {
    const log = new Logger(context,opts);

    return async (ctx, next) => {
        ctx.log = log;
        if (opts.filter && opts.filter.some(v => ctx.path.includes(v))) {
            return next();
        }
        const lastTime = Date.now();
        try {
            await next();
        } catch (e) {
            ctx.log.error(e.message);
        }
        const diffTime = Date.now() - lastTime;
        const defaultFormat = ':remoteAddr ~ '
            + ':url ~ '
            + 'HTTP/:httpVersion ~ '
            + ':method ~ '
            + ':status ~ '
            + ':contentLength ~ '
            + ':referer ~ '
            + ':userAgent ~ '
            + ':responseTime ~ '
            + ':code';
        const defaultTokens = [
            { token: ':remoteAddr', replacement: ctx.headers['x-real-ip'] || ctx.ip },
            { token: ':url', replacement: ctx.path },
            { token: ':httpVersion', replacement: `${ctx.req.httpVersionMajor}.${ctx.req.httpVersionMinor}` },
            { token: ':method', replacement: ctx.method },
            { token: ':status', replacement: ctx.response.status },
            { token: ':contentLength', replacement: 0 },
            { token: ':referer', replacement: ctx.headers.referer || '-' },
            { token: ':userAgent', replacement: ctx.headers['user-agent'] },
            { token: ':responseTime', replacement: diffTime },
            { token: ':code', replacement: ctx.response.body? ctx.response.body.code:1 },
        ];
        let strLog = defaultFormat;
        defaultTokens.forEach((v) => strLog = strLog.replace(v.token, v.replacement));
        ctx.log.acc(strLog);
    };
}
