/**
 * *****************************************************************************
 *
 * 浏览器客户主程序
 *
 * 执行UI渲染任务, 将前端UI程序渲染至客户端浏览器DOM
 *
 * *****************************************************************************
 */

import configureStore from './store/configureStore.mjs';
const AppPromise = import('./App.mjs');
const preloadedState = window.__INITIAL_STATE__
const store = configureStore(preloadedState); 

let container = window.document.getElementById('root'); // get container

if (null == container) {
  container = window.document.createElement('div');
  container.id = 'root';
  window.document.body.appendChild(container);
}

AppPromise.then(m => m.default).then(async App => {
  const element = App(store);

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  if (container.innerHTML) {
    ReactDOM.hydrate(element, container, callback);
  } else {
    ReactDOM.render(element, container, callback);  
  }
});

/**
 * 渲染完成后执行的任务
 */

function callback () {
  console.groupCollapsed('系统信息');
  console.info(`就绪时间: ${new Date()}`);

  if (globalThis.env && globalThis.env !== 'production') {
    console.info(`当前环境:${env}`);
    window.navigator.cookieEnabled && console.info(`cookie支持已启用`);
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
