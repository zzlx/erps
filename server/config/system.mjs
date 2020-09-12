/**
 * *****************************************************************************
 *
 * 系统配置项
 * ============
 *
 * *****************************************************************************
 */

import os from 'os';

export default new Proxy({
  EOL: os.EOL,
  arch: os.arch(),
  cpus: os.cpus(),
  endianness: os.endianness(),
  networkInterfaces: os.networkInterfaces(),
  release: os.release(),
  userInfo: os.userInfo(),
  hostname: os.hostname(),
  host: isSupportIPv6() ? "::" : "0.0.0.0",
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8888,
  pidPrefix: 'org.zzlx',
  platform: os.platform(),
  totalmem: os.totalmem(),
  type: os.type(),
  version: os.version(),
},{
  get: function (target, property, receiver) {
    if (property === 'freemem') return os.freemem();
    if (property === 'sysUptime') return os.uptime();
    if (property === 'processUptime') return process.uptime();

    return Reflect.get(target, property, receiver);
  },
});

/**
 * Utility functions
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
