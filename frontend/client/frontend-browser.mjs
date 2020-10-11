/**
 * *****************************************************************************
 * 
 * 浏览器客户端
 * ============
 *
 * 此部分代码仅在浏览器环境中执行,node环境下执行回出错
 *
 * *****************************************************************************
 */

import assert from '../utils/assert.mjs';
import global from '../utils/global.mjs';
import console from '../utils/console.mjs';
import path from '../utils/path.mjs';
import settings from '../settings.mjs';

const ua = global.navigator.userAgent;

export default function browserRender (element) {
  let container = global.document.getElementById('root');
  assert(global.ReactDOM, 'ReactDOM is not available, please confirmed!');

  if (null == container) {
    container = global.document.createElement('div');
    container.id = 'root';
    global.document.body.appendChild(container);
  }

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  if (container.innerHTML) {
    ReactDOM.hydrate(element, container, callback);
  } else {
    ReactDOM.render(element, container, callback);  
  }
}

function callback () {
  if (global.env !== 'development') return;

  const sysinfo = {
    'cookie-enabled': global.navigator.cookieEnabled,
    'ready-time': new Date().toISOString(),
  };

  console.groupCollapsed('系统信息');
  console.dir(sysinfo);
  console.groupEnd();
}

function detectDevice () {
  const ua = window.navigator.userAgent;
  if ((
    ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1 ) && 
    ua.indexOf('Mobile Safari') !== -1 && 
    ua.indexOf('Chrome') === -1 && 
    ua.indexOf('Windows Phone') === -1
  ) {  }
}

async function test () {
  const ua = window.navigator.userAgent;
  const csv = await import('../utils/csv.mjs').then(m => m.default);

  // 如果客户端时IE浏览器且版本低于IE9,提示升级浏览器
  let ltIE9 = false;

  if (/Trident/i.exec(ua)) {
    const version = /Trident\/(\d{1,2})\.\d{1,2}/i.exec(ua);

    if (version !== null && version[1] < 5) {
      ltIE9 = true;
    }
  }

  // 
  backgroundWork();
}

function backgroundWork () {
  if (global.Worker) {

    const worker = new Worker(`${settings.rootURL}/modules/web-work.mjs`);

    worker.postMessage({cmd: 'start', msg: ['work']});

    worker.onmessage = function(e) {
      //result.textContent = e.data;
      console.log('Message received from worker: ' + e.data);
    }

    worker.addEventListener('error', function (e) {
       console.log([
        'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message
      ].join(''));
    });

  } else {
    console.warn('Your browser doesn\'t support web workers.')
  }
}
