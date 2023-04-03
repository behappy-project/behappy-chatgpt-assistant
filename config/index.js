import {existsSync} from 'fs';
import {name} from '../package.json';

// 配置自检
export const envCfg = (() => {
  console.log(process.env)
  // 加载本地配置
  console.log(`环境: ${process.env.NODE_ENV}`);
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(`加载本地开发环境...`);
    if (existsSync(`${__dirname}/local.json`)) {
      const conf = require('./local.json');
      console.log(`${name} 服务配置参数加载成功`);
      console.log('envCfg:', conf);
      return conf;
    }
    console.error(`${name} 服务配置自检未通过,服务已停止`);
    process.exit();
  }

  // 非本地开发环境
  const conf = require('./config.json');

  // 配置自检
  const checkProperty = (cfgNode) => {
    let result = true;
    for (const pro of Object.keys(cfgNode)) {
      if (typeof cfgNode[pro] === 'object') {
        result = checkProperty(cfgNode[pro]) && result;
        continue;
      }

      // 服务调用参数配置
      cfgNode[pro] = process.env[cfgNode[pro]];
    }

    return result;
  };

  if (!checkProperty(conf)) {
    console.error(`${name} 服务配置自检未通过,服务已停止`);
    process.exit();
  } else {
    console.log(`${name} 服务配置参数加载成功`);
    console.log('envCfg:', conf);
    return conf;
  }
})();

// 系统
export const sysCfg = {
  name,
  port: envCfg.sys.port,
  apiPrefix: '/chat-gpt',
};

