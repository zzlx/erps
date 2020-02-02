/**
 * 配置系统环境变量
 *
 * 读入.env配置
 *
 * @file: env.mjs
 */

/******************************************************************************/
import fs from 'fs';
import path from 'path';
import { DOT_ENV_FILE, } from './config.mjs';
import argvParser from './utils/argvParser.mjs';

const dotEnvConfig = dotenv(DOT_ENV_FILE);

for (let key of Object.keys(dotEnvConfig)) {
  if (process.env[key]) continue; // @todo: 是否覆盖已有配置项
  process.env[key] = dotEnvConfig[key];
}

// 获取并解析命令行参数
const Params = argvParser(process.argv.slice(2)); 

for (let key of Object.keys(Params)) {
  process.env[String(key).toUpperCase()] = String(Params[key]);
}

// 设置系统变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 默认使用生产环境

if (process.env.DEVEL || process.env.DEVELOPMENT) {
  process.env.env.NODE_ENV = 'development';
}

// 默认使用3000端口号
process.env.PORT = process.env.PORT 
  ? Number.parseInt(process.env.PORT) : 3000; 

process.env.HOST = process.env.HOST || 'localhost'; // localhost


/**
 *
 *
 */

function dotenv(envFile) {
  if (!fs.existsSync(envFile)) return {};
  const envFileContent = fs.readFileSync(envFile, 'utf8');
  return parser(envFileContent); 
}

/**
 *
 *
 */

function parser (source) {
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
