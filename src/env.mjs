/**
 * *****************************************************************************
 *
 * 配置系统环境变量
 *
 * 读入.env配置
 *
 * 约定:
 * 1. 优先保证已被设置的环境变量不被改动;
 * 2. 
 *
 * @file: env.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import argvParser from './utils/argvParser.mjs';

const APP_ROOT = path.dirname(path.dirname(import.meta.url).substr(7));

const validArgvs = [
  '--help', '-h',
  '--version', '-v',
  '--env', 
  '--devel',
  '--port',
];

// 获取并解析命令行参数
const Params = argvParser(process.argv.slice(2), validArgvs); 
// 获取并解析.env文件配置参数
const EnvConfig = dotenv(path.join(APP_ROOT, '.env'));

// 合并参数对象
const ENV = Object.assign({}, Params, EnvConfig);

// 写入进程环境
for (let key of Object.keys(ENV)) {
  const KEY = String.prototype.toUpperCase.call(key);
  if (process.env[KEY]) continue; // 已配置项优先,不进行重置
  process.env[KEY] = ENV[key];
}

if (process.env.ENV) {
  if (process.env.ENV === 'development') process.env.NODE_ENV = 'development';
  if (process.env.ENV === 'production')  process.env.NODE_ENV = 'productions';
}

// 确保NODE_ENV变量被设置
// 默认使用生产环境
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; 

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
