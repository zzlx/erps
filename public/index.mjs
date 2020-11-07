/**
 * *****************************************************************************
 * 
 * 前端UI Application
 * ===================
 *
 * *****************************************************************************
 */

// 前端程序执行环境配置
const __dirname = p => p.substr(0, p.lastIndexOf('/'));
const isBrowser = globalThis.document && typeof document === 'object';
const isNative = false;
const isNode = globalThis.process && typeof process.cwd === 'function';
const appURL = new URL(import.meta.url);
const pathname = isBrowser ? location.pathname : '/'; // 获取当前pathname

// 执行前端程序
if (isBrowser) browserRender(); // 浏览器客户端渲染

// 服务器端渲染使用export nodeRender模块

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
 * 服务器端渲染方法
 */

export async function nodeRender () {
  globalThis.env = process.env.NODE_ENV || 'production';
  globalThis.React = await import('react').then(m => m.default);
}

/**
 * Native渲染方法
 */

export function nativeRender () {

}

/**
 * 浏览器渲染方法
 */

export async function browserRender () {
  globalThis.env = appURL.searchParams.get('env') || 'production';
  const storeCreator = await import('./store.mjs').then(m => m.default);

  // 创建程序状态管理器
  const store = storeCreator({location: { pathname: pathname }});

  const App = await import('./containers/index.mjs').then(m => m.default);
  const element = App(store); 

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
