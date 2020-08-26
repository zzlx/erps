/**
 *
 * 渲染完成后执行的任务
 */

import csv from './utils/csv.mjs';

export default function callback () {
  console.groupCollapsed('系统信息');
  console.info(`就绪时间: ${new Date()}`);

  if (globalThis.env && globalThis.env !== 'production') {
    console.info(`当前环境:${env}`);
    window.navigator.cookieEnabled && console.info(`cookie支持已启用`);

    // test
    console.log(csv('test,ttt\n1,2\n3,4'));
  }

  console.info(`使用说明:${window.location.origin}/manual`);
  console.info(`联系我们: ${window.location.origin}/contact`);
  console.groupEnd();

  const ua = window.navigator.userAgent;

  if ((
    ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1 ) && 
    ua.indexOf('Mobile Safari') !== -1 && 
    ua.indexOf('Chrome') === -1 && 
    ua.indexOf('Windows Phone') === -1
  ) {  }


  // 如果客户端时IE浏览器且版本低于IE9,提示升级浏览器
  let ltIE9 = false;

  if (/Trident/i.exec(ua)) {
    const version = /Trident\/(\d{1,2})\.\d{1,2}/i.exec(ua);

    if (version !== null && version[1] < 5) {
      ltIE9 = true;
    }
  }
}
