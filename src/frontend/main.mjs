/**
 * *****************************************************************************
 *
 * Frontend UI System.
 *
 * *****************************************************************************
 */

import Provider from './components/_Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/_Redirect.mjs';
import Route from './components/_Route.mjs';
import Switcher from './components/_Switcher.mjs';

import * as Pages from './containers/index.mjs';

import Store from './redux/Store.mjs';
import global from './utils/global.mjs';
import deviceDetect from './utils/deviceDetect.mjs'

// 配置前端应用标识符
export const CID = 'react-app'; 

/**
 * Application
 *
 * @param {object} store
 * @return {object} element
 */

export default function ReactApp (store) {
  const routes = store.getState('routes')
    .map(item => Object.assign({}, item, { app: Pages[item.app] }))
    .map(route => React.createElement(Route, { 
      path: route.path, 
      component: route.app, 
    }));

  return React.createElement(Provider, { 
    store: store,
    children: React.createElement(Switcher, null, ...routes),
  }); 
}

/**
 * callback function
 */

function cb () {
  const device = deviceDetect(window.navigator.userAgent);
  console.groupCollapsed('欢迎使用前端UI程序!');
  if (device) console.log(`检测到当前客户端设备为:${device}`);
  else console.warn('未检测出当前设备类型😢');
  //console.log(`帮助文档: ${location.origin}/documentation`);
  console.groupEnd();
}

/**
 * 获取container
 */

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
  
  const store = new Store({
    location,
  });

  // 订阅更新
  // 变动发生额存入客户端
  // 客户端存储逻辑判断
  store.subscribe(() => {
  });

  const element = ReactApp(store);

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  const container = getContainerByID.call(window, CID)
  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}
