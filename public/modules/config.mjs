/**
 * *****************************************************************************
 *
 * 客户端配置
 *
 * *****************************************************************************
 */

import path from './utils/path.mjs';

const rootURL = new URL(path.dirname(path.dirname(import.meta.url))); // 根路径

export default new Proxy({
  rootURL: rootURL,
  rootPath: rootURL.href,
}, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  }
});
