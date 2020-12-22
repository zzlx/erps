/**
 * *****************************************************************************
 *
 * 前端程序入口文件
 *
 * *****************************************************************************
 */

import Provider from './components/_Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/_Redirect.mjs';
import Route from './components/_Route.mjs';
import Switcher from './components/_Switcher.mjs';
import * as Pages from './pages/index.mjs';
import Storage from './utils/Storage.mjs';
import global from './utils/global.mjs';
import deviceDetect from './utils/deviceDetect.mjs'

// export container id
export const CID = 'app-root';

/**
 * *****************************************************************************
 *
 * UI Application
 *
 * @param {object} props
 * @return {object} element
 * *****************************************************************************
 */

export default function App (props) {
  const store = props.store;
  const routes = store.getState('routes')
    .map(item => Object.assign({}, item, { app: Pages[item.app] }))
    .map(route => React.createElement(Route, { 
      path: route.path, 
      component: route.app, 
    }));

  const router = React.createElement(Switcher, null, ...routes);
  return React.createElement(Provider, { store }, router); 
}

/**
 * callback function
 */

function cb () {
  const device = deviceDetect(window.navigator.userAgent);

  console.groupCollapsed('欢迎使用前端UI程序!');
  if (device) console.log(`检测到当前客户端设备为:${device}`);
  else console.warn('未检测出当前设备类型😢');
  console.log(`使用帮助文档: ${location.origin}/documentation`);
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

export function getContainerByID (id) {
  let container = this.document.getElementById(id);

  if (null == container) {
    container = this.document.createElement('div');
    container.id = id;
    this.document.body.appendChild(container);
  }

  return container;
}

/**
 * *****************************************************************************
 *
 * 执行浏览器客户端渲染程序
 * Rendering the app Element into the DOM
 *
 * *****************************************************************************
 */

if (global.window && global.window.document) {
  //Detect environment and render UI Application
  const __url = new URL(import.meta.url);
  global.env = __url.searchParams.get('env') || 'production';

  const ua = window.navigator.userAgent;
  //if (/MSIE/.test(ua)) .innerHTML = '请使用Edge浏览器继续访问!';

  const store = new Storage({
    location,
  });

  // 订阅更新
  // 变动发生额存入客户端
  // 客户端存储逻辑判断
  //
  store.subscribe(() => {
    console.log('test');
  });

  const element = App({store});

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  const container = getContainerByID.apply(window, CID)
  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}
