/**
 *
 * 配置系统环境变量
 *
 * @file: env.mjs
 */

/******************************************************************************/
import fs from 'fs';
import path from 'path';
import { APP_ROOT } from './config.mjs';
import envParser from './utils/envParser.mjs';

process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 默认使用生产环境
process.env.PORT = process.env.PORT || 3000; // 默认使用3000端口号

const dotEnvConfig = dotenv(path.join(APP_ROOT, '.env'));
for (let key of Object.keys(dotEnvConfig)) {
  if (process.env[key]) continue; // @todo: 是否覆盖已有配置项
  process.env[key] = dotEnvConfig[key];
}

function dotenv(envFile) {
  if (!fs.existsSync(envFile)) return {};
  const envFileContent = fs.readFileSync(envFile, 'utf8');
  const parsedObj = parser(envFileContent); 
  return parsedObj;
}

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

/******************************************************************************/
