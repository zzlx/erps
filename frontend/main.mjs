/**
 * *****************************************************************************
 * 
 * Main application
 *
 * Run in browser environment
 *
 * *****************************************************************************
 */

import App from './App.mjs';
import deviceDetect from './utils/deviceDetect.mjs'
import global from './utils/global.mjs';

// Get env from searchParams
const __url = new URL(import.meta.url);
global.env = __url.searchParams.get('env') || 'production';

// Render UI application to DOM
DOMRender(App({
  location: location,
}), 'root', cb);

/**
 * *****************************************************************************
 *
 * Utility functions
 *
 * *****************************************************************************
 */ 

/**
 * 
 * callback function
 *
 */

function cb () {
  console.groupCollapsed('UI程序已就绪🐂');
  console.info('欢迎使用前端UI程序！');
  console.log(`使用帮助文档: ${location.origin}/documentation`);
  console.log(`检测到当前客户端设备为:${deviceDetect(window.navigator.userAgent)}`);
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

/**
 * DOM render in browser client
 *
 * @param {object} element reactElement
 * @param {string} id container id
 */

function DOMRender (element, id, cb = () => {}) {
  if (window == null) return console && console.error('Unknown environment.');
  const ua = window.navigator.userAgent;
  //if (/MSIE/.test(ua)) .innerHTML = '请使用Edge浏览器继续访问!';

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = window.document.getElementById(id);

  if (null == container) {
    container = window.document.createElement('div');
    container.id = id;
    window.document.body.appendChild(container);
  }

  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}
