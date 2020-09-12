/**
 * 根据request.headers['user-agent']字段,判断设备类型
 *
 */

import crypto from 'crypto';
import util from 'util';
const debug = util.debuglog('services');

// 存储设备缓存
const deviceCache = {}; // @todo: 加入数据库

/**
 * 解析user-agent字符串，输出设备类型
 *
 */

export default function detectDevice (userAgent) {
  const hash = crypto.createHash('sha1').update(userAgent).digest('hex');
  console.log(process.env)
  if (deviceCache[hash]) return deviceCache[hash];

  let os, version, browser;

  if (
    userAgent.indexOf('Mozilla/5.0') > -1 && 
    userAgent.indexOf('Android ') > -1 && 
    userAgent.indexOf('AppleWebKit') > -1 && 
    userAgent.indexOf('Chrome') === -1
  ) {
    os = 'android';
  }

  const matcheOS = /((?:iPhone OS)|(?:Mac OS X)) ([0-9_.]+)/.exec(userAgent);

  if (matcheOS) {
    debug(matcheOS);
    os = matcheOS[1] + '/' + matcheOS[2];
  }

  const matcheBrowser = /(?:Version\/([0-9_.]+)).*(Safari)/g.exec(userAgent);

  if (matcheBrowser) {
    debug(matcheBrowser);
    browser = matcheBrowser[2] + '/' + matcheBrowser[1];
  }

  return ({ os, browser});
}
