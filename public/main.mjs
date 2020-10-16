/**
 * *****************************************************************************
 * 
 * 前端应用程序
 * ============
 *
 * > ##### 注意:
 * > 此目录下源码模块在部署前端程序时会暴露于网络，请勿存放敏感数据.
 *
 * *****************************************************************************
 */

import createStore from './store/createStore.mjs';
import App from './apps/index.mjs';

const dirname = p => p.substr(0, p.lastIndexOf('/'));
const url = new URL(import.meta.url);
const baseURI = dirname(url.href);   

// @todos: 
// 完善客户端环境的判断 
// Wechat客户端环境
// Dingtalk客户端环境
const isBrowser = globalThis.document && typeof document === 'object';
const isNode = globalThis.process && typeof process.cwd === 'function';
const isNative = false;

// 前端执行环境配置
globalThis.env = isBrowser ? url.searchParams.get('env') : isNode 
  ? process.env.NODE_ENV : 'production';

// 创建store对象
const store = createStore({}); 

// 前端程序执行环境配置
if (isBrowser) browserRender(store); // 浏览器客户端渲染
if (isNative) nativeRender(store);  // Native环境

/**
 * Browser client render
 *
 * @params {object} iniatialState 初始状态值
 */

export function browserRender () {
  const element = App(store); 
  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  const container = getElementById('root');
  if (container.innerHTML) ReactDOM.hydrate(element, container, renderCB);
  else ReactDOM.render(element, container, renderCB);  
}

/**
 * Node(/server) render
 *
 * @params {object} iniatialState 初始状态值
 * @return {string} staticString 返回渲染字符串
 */

export function nodeRender (iniatialState = {}) {
  globalThis.env = globalThis.process.env.NODE_ENV;
  return import('react-dom/server').then(() => {
  });
}

/**
 * Native render
 */

export function nativeRender () {

}


/**
 * 渲染回调函数
 */

function renderCB () {
  console.groupCollapsed('提示信息');
  console.info('前端程序已就绪,欢迎使用!');

  if (isBrowser) {
    console.info('当前为浏览器环境.');
    const ua = window.navigator.userAgent;

    // 如果客户端时IE浏览器且版本低于IE9,提示升级浏览器
    let ltIE9 = false;

    if (/Trident/i.exec(ua)) {
      const version = /Trident\/(\d{1,2})\.\d{1,2}/i.exec(ua);

      if (version !== null && version[1] < 5) {
        ltIE9 = true;
      }
    }

    if (ltIE9) globalThis.window.alert('建议升级浏览器至最新版本!');
  }

  'http:' === url.protocol && console.warn('非https协议下部分功能无法正常使用.');
  'file:' === url.protocol && console.warn('暂不支持在浏览器本地环境中使用.');
  console.groupEnd();
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
