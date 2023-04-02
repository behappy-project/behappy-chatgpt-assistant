const assert = require('assert')
const sysCode = require('../config/sysCode.json')


exports.resMsg = (opts = {}) => {
    // response method.
    const send = function (...args) {
        let self = this;

        if (self.body) return;

        const msgCfg = {...opts, ...sysCode};
        if (typeof args[0] === 'string') {
            if (!msgCfg[args[0]]) {
                return this.body = args[0];
            }
        } if (typeof args[0] === 'object') {
            if ('code' in args[0]) return this.body = args[0];
        }

        const [code, data, count] = args;
        if (code < 1000 && code !== 200) {
            if (typeof data === 'string') {
                this.message = data;
            }
            return;
        }

        let body = {...(msgCfg[code] || sysCode['SystemError'])};
        if (code === 'Success') {
            body.data = data || {};
            if (count !== undefined) {
                body.count = count;
            }
        } else {
            body.error = (data && data.message) || data || '';
        }

        self.body = body;
    };

    // biz assert.
    const ifFalse = function (value, code = 'SystemError', message = '') {
        let self = this;

        if (!value) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            self.send(code, message);
            assert(false, message || (opts[code] && opts[code].msg) || code || '');
        }
    };

    return async (ctx, next) => {
        ctx.send = send.bind(ctx);
        ctx.ifFalse = ifFalse.bind(ctx);

        await next();
    };
};
