/**
 * *****************************************************************************
 *
 *
 * 运行环境配置程序
 *
 * 配置项目的优先级: 
 *
 * * 系统默认项: ※ 系统默认配置或无配置 
 * * 文件配置项: ※※ dotenv文件配置项覆盖默认值
 * * 命令行配置: ※※※ 命令行配置具有最高优先级
 *
 * @TODOS:
 * dotenv文件
 * 记录命令行环境配置项,下次启动时继续使用
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import paths, { appName } from './paths.mjs';
import system from './system.mjs';

if (fs.existsSync(paths.ENV)) {
  const dotenvObj = envParser(fs.readFileSync(paths.ENV));
  assert(typeof dotenvObj === 'object', '解析.env文件出错');

  for (let env of Object.keys(dotenvObj)) {
    if (process.env[env] == null) process.env[env] = dotenvObj[env];
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('exit', code => {
  const uptime = Math.ceil(process.uptime()*1000);
  const pid = process.pid;
  const title = process.title ? String(process.title).toUpperCase() : 'Process';
  process.env.NODE_ENV === 'development' && 
  console.info(`${title}(PID:${pid}) is running ${uptime}ms before exit.`);
});

// 被捕获的exception\rejection,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.log(error);
});

// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
});

/**
 * 环境配置解析器
 *
 * 解析获取到的命令行参数列表，返回参数对象
 *
 * @params {string} env
 * @return {object} state
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
