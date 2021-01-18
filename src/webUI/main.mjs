/**
 * *****************************************************************************
 *
 * UI Application.
 *
 * *****************************************************************************
 */

import Provider from './components/_Provider.mjs';
import React from './components/_React.mjs';
import Redirect from './components/_Redirect.mjs';
import Route from './components/_Route.mjs';
import Switcher from './components/_Switcher.mjs';

import * as Pages from './apps/index.mjs';

import Store from './redux/Store.mjs';
import global from './utils/global.mjs';
import deviceDetect from './utils/deviceDetect.mjs'

const re = Symbol('react-element');

export default class Main {
  constrctor (initialState = {}) {
    this.CID = 'root';
    this.store = new Store(initialState); 
  }

  get element () {
    if (this[re] == null) this[re] = ReactApp({ store: this.store }); 
    return this[re];
  }

  /**
   * Rendering the app Element into the DOM
   */

  render () {
    //Detect environment and render UI Application
    const __url = new URL(import.meta.url);
    global.env = __url.searchParams.get('env') || 'production';

    const ua = window.navigator.userAgent;
    //if (/MSIE/.test(ua)) .innerHTML = '请使用Edge浏览器继续访问!';
    
    // 存在服务端渲染等页面使用hydrate方法渲
    // 空的容器对象上使用render方法渲染
    // 判断container是否存在服务端渲染内容
    // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
    let container = document.getElementById(this.CID);

    if (null == container) {
      container = document.createElement('div');
      container.id = id;
      document.body.appendChild(container);
    }

    if (container.innerHTML) ReactDOM.hydrate(this.element, container, cb);
    else ReactDOM.render(this.element, container, cb);  
  }
}

if (global.window && global.window.document) new Main({ location }).render();

/**
 * *****************************************************************************
 *
 * Utilities
 *
 * *****************************************************************************
 */


/**
 * Application
 *
 * @param {object} store
 * @return {object} element
 */

function ReactApp (props) {
  const { store } = props;

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
 *
 * 通知
 *
 * 注意使用场合
 *
 */

function notification () {
  if (window && window.Notification == null) return;
  Notification.requestPermission(); // 获取授权

  const notification = new Notification('新消息', {
    body: `数据已经准备就绪请查看`,
    silent: false, // 通知出现是否提示音
    //sound: '', // 定义通知出现时的声音资源
    icon: 'https://avatars2.githubusercontent.com/u/15223841?s=96&v=4'
  });

  notification.onclick = (event) => {
    window.open('/notice', 'test');
    window.focus();
    notification.close();
  };
}
