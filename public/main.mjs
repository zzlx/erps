/**
 * *****************************************************************************
 * 
 * 前端应用程序
 * ============
 *
 * 用于生成UI界面并管理用户操作及数据
 *
 * > ##### 注意:
 * > 此目录下源码模块在部署前端程序时会暴露于网络，请勿存放敏感数据.
 *
 * *****************************************************************************
 */

// 执行环境设置
const url = new URL(import.meta.url);
globalThis.env = url.searchParams.get('env');

(async function main () {
  const isBrowser = globalThis.document && typeof globalThis.document === 'object';
  if (isBrowser) return renderInBrowser(); // 浏览器客户端渲染

  // @todos: 完善客户端环境的判断 
  // Native环境
  // Wechat客户端环境
  // Dingtalk客户端环境
  // const isNode = globalThis.process && typeof globalThis.process.exit == 'function';
  // if (isNative) return renderInNode(); // Node服务端渲染

})().catch(console.error);

async function renderInBrowser () {
  if (globalThis.ReactDOM == null) throw new Error('ReactDOM is needed!');

  const app = await import('./apps/index.mjs').then(m => m.default);
  const element = app(); 

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  const container = getElementById('root');
  if (container.innerHTML) ReactDOM.hydrate(element, container, callback);
  else ReactDOM.render(element, container, callback);  
}

async function renderInNode () {

}

function callback () {
  console.groupCollapsed('系统信息');
  console.dir({
    'cookie-enabled': globalThis.navigator.cookieEnabled,
  });
  console.groupEnd();
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

function detectDevice () {
  const ua = window.navigator.userAgent;
  if ((
    ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1 ) && 
    ua.indexOf('Mobile Safari') !== -1 && 
    ua.indexOf('Chrome') === -1 && 
    ua.indexOf('Windows Phone') === -1
  ) {  }
}


/**
 * 获取element,如不存在则创建并附加至body
 */

function getElementById (id) {
  let element = window.document.getElementById(id);

  if (null == element) {
    element = window.document.createElement('div');
    element.id = id;
    window.document.body.appendChild(element);
  }

  return element;
}
