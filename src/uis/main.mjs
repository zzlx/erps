import Provider from './components/Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/Redirect.mjs';
import Route from './components/Route.mjs';
import Switcher from './components/Switcher.mjs';
import * as Pages from './pages/index.mjs';
import Storage from './utils/Storage.mjs';
import global from './utils/global.mjs';
import deviceDetect from './utils/deviceDetect.mjs'

/**
 * UI Application
 *
 * @param {object} state
 * @return {object} element
 */

export default function App (state) {
  const store = new Storage(state);

  const routes = [
    // route配置
    { path: '/', app: 'HomePage' },
    { path: '/*', app: 'NotFound' },
  ]
    .map(item => Object.assign({}, item, { app: Pages[item.app] }))
    .map(route => React.createElement(Route, { 
      path: route.path, 
      component: route.app, 
    }));

  const router = React.createElement(Switcher, { 
    location: store.getState('location'),
  }, ...routes);

  return React.createElement(Provider, { store }, router); 
}

/**
 * 
 * callback function
 *
 */

function cb () {
  console.groupCollapsed('欢迎使用前端UI程序!');
  console.log(`使用帮助文档: ${location.origin}/documentation`);
  console.log(
    `检测到当前客户端设备为:${deviceDetect(window.navigator.userAgent)}`);
  console.groupEnd();
}

/**
 * web socket client
 */

function getWebSocket () {
  const ws = new WebSocket(`wss://${appURL.host}/api/socket`);

  ws.onopen = (event) => {
    console.log('webSocket is connected.');
    this.send("Client: Hello!");
  };

  ws.onmessage = (e) => {
    if(typeof e.data === 'string') console.log("from server: ", e.data);

    if(e.data instanceof ArrayBuffer){
      const buffer = e.data;
      console.log("Received arraybuffer");
    }
  }

  ws.onclose = () => console.warn("Connection is closed.");

  return ws;
}

/**
 * Web Worker
 */

function getWebWorker () {
  self.addEventListener('message', function (e) {
    const data = e.data;

    switch (data.cmd) {
      case 'start':
        self.postMessage('WORKER STARTED: ' + data.msg);
        break;
      case 'stop':
        self.postMessage('WORKER STOPPED: ' + data.msg);
        self.close(); // Terminates the worker.
        break;
      default:
        self.postMessage('Unknown command: ' + data.msg);
    };
  }, false);
}

// Detect environment and render UI Application
if (global.window && global.window.document) {
  const __url = new URL(import.meta.url);
  global.env = __url.searchParams.get('env') || 'production';

  const ua = window.navigator.userAgent;
  //if (/MSIE/.test(ua)) .innerHTML = '请使用Edge浏览器继续访问!';

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = window.document.getElementById('root');

  if (null == container) {
    container = window.document.createElement('div');
    container.id = id;
    window.document.body.appendChild(container);
  }

  const element = App({
    location,
  });

  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}
