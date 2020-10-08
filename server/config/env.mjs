/**
 * *****************************************************************************
 *
 * 系统环境配置
 *
 * *****************************************************************************
 */

import fs from 'fs';
import paths from './paths.mjs';

// 如果
if (fs.existsSync(paths.ENV)) {
  const envObj = envParser(fs.readFileSync(paths.ENV));
  if (typeof envObj === 'object') {
    for (let env of Object.keys(envObj)) {
      //if (process.env[env] === null) 
      process.env[env] = envObj[env];
    }
  }
}

// 默认环境为production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('exit', code => {
  debug(`${process.title}(PID:${process.pid}) is exit with code ${code}.`);
});


// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.error('Caught exception: %o', error);
  console.error('Origin exception: %s', origin);
});

// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection: %o', reason);
});

/**
 * *****************************************************************************
 *
 * 环境配置解析器
 *
 * 解析获取到的命令行参数列表，返回参数对象
 *
 * @params {string} env
 * @return {object} state
 * *****************************************************************************
 */

function envParser (source = '') {
  const obj = Object.create(null);

  source.toString().split('\n').forEach(line => {
    const keyValuePair = line.match(/^s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (null !== keyValuePair) {
      const key = keyValuePair[1]; 
      let value = keyValuePair[2] || '';
      const len = value ? value.length : 0;
      if (value>0 && value.charAt(0) === '"' && value.charAt(len -1) === '"') {
        value = value.replace(/\\n/gm, '');
      }
    
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      obj[key] = value;
    }
  });

  return obj;
}
