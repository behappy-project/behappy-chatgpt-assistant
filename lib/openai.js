const {Configuration, OpenAIApi} = require('openai');
const tunnel = require('tunnel');
const axios = require('axios');

module.exports = (opts = {}) => {
  const configuration = new Configuration({
    apiKey: opts.key,
  });
  let defaultOpts = {
    timeout: 5 * 60 * 1000,
    maxContentLength: 20 * 1024 * 1024,
    maxBodyLength: 20 * 1024 * 1024,
    withCredentials: true,
  };
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    // 本地开发
    defaultOpts = {
      ...defaultOpts,
      httpsAgent: tunnel.httpsOverHttp({
        proxy: {
          host: '127.0.0.1',
          port: 7890,
        },
      }),
    };
  }
  const client = axios.create(defaultOpts);
  const openai = new OpenAIApi(configuration, opts.host, client);
  return async (ctx, next) => {
    ctx.openai = openai;
    await next();
  };
};
