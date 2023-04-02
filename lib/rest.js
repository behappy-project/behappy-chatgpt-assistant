const axios = require('axios');
const https = require('https');

/**
 * 重试
 * @param adapter
 * @param options
 * @returns {function(*): Promise<unknown>}
 */
function retryAdapterEnhancer(adapter, options) {
    const {times = 0, delay = 300} = options;

    return async (config) => {
        const {retryTimes = times, retryDelay = delay} = config;
        let __retryCount = 0;
        const request = async () => {
            try {
                return await adapter(config);
            } catch (err) {
                // 判断是否进行重试
                if (!retryTimes || __retryCount >= retryTimes) {
                    return Promise.reject(err);
                }
                __retryCount++; // 增加重试次数
                // 延时处理
                const delay = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, retryDelay);
                });
                // 重新发起请求
                return delay.then(() => {
                    return request();
                });
            }
        };
        return request();
    };
}

class RestClient {
    constructor(options) {
        this.defaultOpts = {
            timeout: 60000,
            headers: {
                'User-Agent': `${options.appName}`,
                'Connection': 'keep-alive',
                'Content-Type': 'application/json;charset=utf-8',
            },
            maxContentLength: 20 * 1024 * 1024,
            maxBodyLength: 20 * 1024 * 1024,
            withCredentials: true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            // 重试次数
            retryTimes: 1,
            adapter: retryAdapterEnhancer(axios.defaults.adapter, {
                retryDelay: 500,
            }),
        };
        this.client = axios.create({
            ...this.defaultOpts,
            ...options,
        });
    }

    set context(ctx) {
        this.ctx = ctx;
    }

    static getInstance(opts) {
        if (!RestClient.instance) {
            RestClient.instance = new RestClient(opts);
        }
        return RestClient.instance;
    }

    _mixHeaders(opts, form) {
        opts.headers = {
            ...opts.headers,
            'Authorization': `Bearer ${opts.apiKey}`,
        };
        if (form) {
            opts.headers = {...opts.headers, ...form.getHeaders()};
        }
    }

    async get(url, params = {}, opts = {}) {
        const self = this;
        const reqParams = {};
        if (typeof params === 'object') {
            for (const [key, val] of Object.entries(params)) {
                if ([undefined, null].includes(val) || val.length === 0) continue;
                if (val instanceof Array) {
                    reqParams[key] = val.join();
                    continue;
                }
                reqParams[key] = val;
            }
        }
        this._mixHeaders(opts);

        return new Promise((resolve, reject) => {
            self.client
                .get(url, {params: reqParams, ...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    self.ctx.log.error(err.message, 'GET', url, params);
                    reject(err);
                });
        });
    }

    async post(url, data, opts = {}) {
        const self = this;
        this._mixHeaders(opts);

        return new Promise((resolve, reject) => {
            self.client
                .post(url, data, {...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    if (data && data.imgbase64) {
                        self.ctx.log.debug(err.message, 'POST', url, 'base64图片解析错误');
                    } else if (typeof data === 'string') {
                        self.ctx.log.error(err.message, 'POST', url, data.slice(0, 100));
                    } else {
                        self.ctx.log.error(err.message, 'POST', url, data);
                    }
                    reject(err);
                });
        });
    };

    async put(url, data, opts = {}) {
        const self = this;
        this._mixHeaders(opts);

        return new Promise((resolve, reject) => {
            self.client
                .put(url, data, {...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    self.ctx.log.error(err.message, 'PUT', url, data);
                    reject(err);
                });
        });
    };

    async del(url, data, opts = {}) {
        const self = this;
        this._mixHeaders(opts);

        return new Promise((resolve, reject) => {
            self.client
                .delete(url, {data, ...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    self.ctx.log.error(err.message, 'DEL', url, data);
                    reject(err);
                });
        });
    };

    async patch(url, data, opts = {}) {
        const self = this;
        this._mixHeaders(opts);

        return new Promise((resolve, reject) => {
            self.client
                .patch(url, data, {...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    self.ctx.log.error(err.message, 'PATCH', url, data);
                    reject(err);
                });
        });
    };

    async upload(url, form, opts = {}) {
        const self = this;
        this._mixHeaders(opts, form);

        return new Promise((resolve, reject) => {
            self.client
                .post(url, form, {...opts})
                .then(res => resolve(res.data))
                .catch((err) => {
                    self.ctx.log.error(err.message, 'UPLOAD', url);
                    reject(err);
                });
        });
    };
}

exports.rest = (opts = {}, ctx) => {
    const rest = RestClient.getInstance(opts);
    if (ctx) {
        rest.context = ctx;
        ctx.rest = rest
    }
    return async (ctx, next) => {
        rest.context = ctx;
        ctx.rest = rest;
        return await next();
    };
};
