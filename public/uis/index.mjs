/**
 * *****************************************************************************
 * 
 * 前端主程序
 * ===========
 *
 * 执行前端程序生成UI
 *
 * *****************************************************************************
 */

import Store from './utils/ReduxStore.mjs';

// 准备执行环境
const __dirname = p => p.substr(0, p.lastIndexOf('/'));
const appURL = new URL(import.meta.url);
const store = new Store();

if (globalThis.document && typeof document === 'object') {
  globalThis.env = appURL.searchParams.get('env') || 'production';
  browserRender(); // 浏览器客户端渲染
}

/**
 * 浏览器渲染
 */

async function browserRender () {
  const App = await import('./ReactApp.mjs').then(m => m.default); 

  // 创建程序状态管理器
  const element = App(); 

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = window.document.getElementById('root');

  if (null == container) {
    container = window.document.createElement('div');
    container.id = id;
    window.document.body.appendChild(container);
  }

  const ua = window.navigator.userAgent;
  if (/MSIE/.test(ua)) return container.innerHTML = '请使用Edge浏览器继续访问!';

  const renderCallback = () => {
    console.groupCollapsed('系统提示:');
    console.info('前端程序已就绪!');
    console.groupEnd();
    getWebSocket(); // 开启websocket
  }

  if (container.innerHTML) ReactDOM.hydrate(element, container, renderCallback);
  else ReactDOM.render(element, container, renderCallback);  
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
