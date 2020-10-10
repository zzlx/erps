/**
 * *****************************************************************************
 * 
 * 客户端配置
 * ==========
 *
 *
 *
 * *****************************************************************************
 */

import path from './utils/path.mjs';
import global from './utils/global.mjs';

const rootURL = new URL(path.dirname(path.dirname(import.meta.url)));

export default new Proxy({
  host: rootURL.host,
  hostname: rootURL.hostname,
  port: rootURL.port,
  protocol: rootURL.protocol,
  root: rootURL.href,
}, {
  get: function (target, property, receiver) {

    if (property === 'port' && target.port === '') {
      if (target.protocol === 'https:') return '443';
      if (target.protocol === 'http:') return '80';
    }
    
    return Reflect.get(target, property, receiver);
  }
});

// 注册错误处理程序
global.addEventListener("unhandledrejection", function(err, promise) {
  console.log(err);
});

global.addEventListener("error", function (msg, url, lineNo, columnNo, error) {
  console.log(msg, url, lineNo, columnNo, error);
});
