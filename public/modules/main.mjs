/**
 * *****************************************************************************
 *
 * 浏览器客户主程序
 *
 * 执行UI渲染任务, 将前端UI程序渲染至客户端浏览器DOM
 *
 * *****************************************************************************
 */

import csv from './utils/csv.mjs';
import callback from './callback.mjs';
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
