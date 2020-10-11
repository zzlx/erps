/**
 * *****************************************************************************
 * 
 * 前端配置项目
 * ============
 *
 *
 *
 * *****************************************************************************
 */

import global from './utils/global.mjs';
import path from './utils/path.mjs';

const APP_ROOT = path.dirname(path.dirname(import.meta.url));
const rootURL = new URL(APP_ROOT);

export default new Proxy({
  assets: path.join(APP_ROOT, 'assets'),
  modules: path.join(APP_ROOT, 'modules'),
  host: rootURL.host,
  hostname: rootURL.hostname,
  port: rootURL.port,
  protocol: rootURL.protocol,
  root: rootURL.href,
}, {
  get: function (target, property, receiver) {
    if (property === 'isBrowser') return global.document ? true : false;
    if (property === 'isWeChat') return false;
    if (property === 'isDingTalk') return false;

    if (property === 'port' && target.port === '') {
      if (target.protocol === 'https:') return '443';
      if (target.protocol === 'http:') return '80';
    }
    
    return Reflect.get(target, property, receiver);
  }
});
