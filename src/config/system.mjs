/**
 * *****************************************************************************
 *
 * 系统配置项
 *
 * *****************************************************************************
 */

import os from 'os';
import { packageJSON } from './paths.mjs';

export default new Proxy({
  totalmem: os.totalmem(),
  arch: os.arch(),
  cpus: os.cpus(),
  endianness: os.endianness(),
  networkInterfaces: os.networkInterfaces(),
  release: os.release(),
  userInfo: os.userInfo(),
  hostname: os.hostname(),
  ipv6: isSupportIPv6(),
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8888,
  pidPrefix: 'org.zzlx',
  platform: os.platform(),
  type: os.type(),
  version: {
    app: packageJSON.version,
    os: os.version(),
    node: process.version,
  },
  EOL: os.EOL,
},{
  get: function (target, property, receiver) {

    if (property === 'freemem') return os.freemem();
    if (property === 'osUptime') return os.uptime();
    if (property === 'processUptime') return process.uptime();

    return Reflect.get(target, property, receiver);
  },
});

/**
 * 判断是否支持ipv6
 *
 * @return {boolean} true/false
 */

function isSupportIPv6 () {
  let hasIPv6 = false;
  const interfaces = os.networkInterfaces();

  for (let item of Object.keys(interfaces)) {
    for (let ip of interfaces[item]) {
      if (ip.family === 'IPv6') {
        hasIPv6 = true;
        break;
      }
    }
  }
  
  return hasIPv6;
}
