/**
 * *****************************************************************************
 *
 * system 配置项管理器
 *
 * *****************************************************************************
 */

import os from 'os';
import fs from 'fs';
import { configs } from './configs.mjs';
import { isWin, isMac, isLinux } from '../utils/index.mjs';

export const system = new Proxy({
  isSupportIPv6: isSupportIPv6(),
}, {
  get: function (target, property, receiver) {
    if (property === 'IPv6') return isSupportIPv6();
    if (property === 'passphrase') return configs.passphras;

    if (property === 'key') return fs.readFileSync(configs.key);
    if (property === 'cert') return fs.readFileSync(configs.cert);
    if (property === 'ca') return fs.readFileSync(configs.ca);
    if (property === 'chain') return fs.readFileSync(configs.chain);

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
      if (network.family === 6) { hasIPv6 = true; break; }
    }

    if (hasIPv6) break;
  }

  return hasIPv6;
}

/**
 * 检测是否配置systemd service
 */

async function isSupportSystemd (service) {
  const fs = await import('fs'); 
  const test = [
    "/usr/lib/systemd/system",
    "/etc/systemd/system/multi-user.target.wants",
  ].map(loc => fs.existsSync(path.join(loc, service)));
}
