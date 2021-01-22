/**
 * *****************************************************************************
 *
 * system 配置项管理器
 *
 * *****************************************************************************
 */

import os from 'os';
import conf from './configurations.mjs'; // 配置项目

export default new Proxy({
  arch: os.arch(),
  totalmem: os.totalmem(),
  platform: os.platform(),
  release: os.release(),
  userInfo: os.userInfo(),
  port: conf.port || process.env.PORT || '3000',
  host: isSupportIPv6() ? '::' : '0.0.0.0',
}, {
  get: function (target, property, receiver) {

    // 动态获取的配置
    if (property === 'hostname') return os.hostname();
    if (property === 'homedir') return os.homedir();
    if (property === 'networkInterfaces') return os.networkInterfaces();
    if (property === 'freemem') return os.freemem();
    if (property === 'cpus') return os.cpus();
    if (property === 'IPv6') return isSupportIPv6();

    return Reflect.get(target, property, receiver);
  },
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
