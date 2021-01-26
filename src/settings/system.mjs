/**
 * *****************************************************************************
 *
 * system 配置项管理器
 *
 * *****************************************************************************
 */

import os from 'os';

const system = {
  port: process.env.PORT || '3000',
  host: isSupportIPv6() ? '::' : '0.0.0.0',
};

export default new Proxy(system, {
  get: function (target, property, receiver) {
    // 动态获取的配置
    if (property === 'IPv6') return isSupportIPv6();

    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {

  }
});

/**
 * 判断系统是否支持IPv6
 */

function isSupportIPv6 () {
  let hasIPv6 = false;

  for (const networkInterface of Object.values(os.networkInterfaces())) {
    for (const network of networkInterface) {
      if (network.family === 'IPv6') { hasIPv6 = true; break; }
    }

    if (hasIPv6) break;
  }

  return hasIPv6;
}
