/**
 * *****************************************************************************
 * 
 * 客户端主程序
 * ============
 *
 * *****************************************************************************
 */

(async function main () {
  const ua = window.navigator.userAgent;
  const path = await import('./utils/path.mjs');
  const assert = await import('./utils/assert.mjs').then(m=>m.default)
  const preloadedState = window.__INITIAL_STATE__
  const configureStore = await import('./store/configureStore.mjs').then(m => m.default);
  const store = configureStore(preloadedState); 
  const settings = store.getState('settings')

  assert(globalThis.React, 'React is not available, please confirmed!');
  assert(globalThis.ReactDOM, 'ReactDOM is not available, please confirmed!');

  import('./UI.mjs').then(m => m.default).then(async App => {

    const element = App(store);

    let container = window.document.getElementById('root');

    if (null == container) {
      container = window.document.createElement('div');
      container.id = 'root';
      window.document.body.appendChild(container);
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

  });

  function callback () {
    console.groupCollapsed('系统信息');
    console.info(`就绪时间: ${new Date()}`);

    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1 || ua.indexOf('Firefox') > -1) {
      if (/^(https?|file):$/.test(window.location.protocol)) {
        console.log('');
      }
    }

    if (globalThis.env && globalThis.env !== 'production') {
      console.info(`当前环境:${env}`);

      // @todo:  消息框提示
      window.navigator.cookieEnabled && console.info(`cookie支持已启用`);
    }

    console.groupEnd();
  }
})().catch(console.error);

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
  const csv = await import('./utils/csv.mjs').then(m => m.default);

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
  if (globalThis.Worker) {

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
