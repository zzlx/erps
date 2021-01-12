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
    node: process.version,
    system: os.version(),
  },
  EOL: os.EOL,
  errors: [],
}, {
  get: function (target, property, receiver) {

    if (property === 'freemem') return os.freemem();
    if (property === 'osUptime') return os.uptime();
    if (property === 'processUptime') return process.uptime();

    return Reflect.get(target, property, receiver);
  },
});

/**
 * detected ipv6 support
 *
 * @return {boolean} true/false
 */

function isSupportIPv6 () {
  let hasIPv6 = false;
  const interfaces = os.networkInterfaces();

  for (let item of Object.keys(interfaces)) {
    for (let ip of interfaces[item]) if (ip.family === 'IPv6') { hasIPv6 = true; break; }
    if (hasIPv6) break;
  }
  
  return hasIPv6;
}
