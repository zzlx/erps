/**
 * *****************************************************************************
 *
 * 客户端配置
 *
 * *****************************************************************************
 */

import path from './utils/path.mjs';

// 获取APP根路径
const rootURL = new URL(path.dirname(path.dirname(import.meta.url)));

export default new Proxy({
  rootPath: rootURL.href,
  protocol: rootURL.protocol,
}, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  }
});
