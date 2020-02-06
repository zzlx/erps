/**
 * 渲染前端程序到DOM
 *
 * Render ui application to DOM.
 *
 * 1. Consider the condition of server side render;
 * 2. set api address if not exists
 *
 * @file dom.mjs
 */

import ReactDOM from 'react-dom';
import App from '../apps/index.mjs';
import { store } from '../store/index.mjs';
import { getApiAddress } from '../store/actions/index.mjs';
import global from '../utils/global.mjs';

// Prepare parameters for ReactDOM render method.
const element = App(store);
let container = global.document.getElementById('root');

//  
if (null == container) {
  container = global.document.createElement('div');
  container.id = 'root';
  global.document.body.appendChild(container);
  //global.document.body.insertBefore(container, document.body.firstChild);
}

// if the container has contents, use hydrate method,
// else, use the render method.
if (container.innerHTML) { 
  ReactDOM.hydrate(element, container, callback);  
} else { 
  ReactDOM.render(element, container, callback);  
}

// callback function
// do something about configuration tasks.
function callback() {
  // configure api_address
  // 从store中获取api_address, 如果未配置，则从服务器获取
  const api_address = store.getState('profiles', 'api_address');

  // 如果还未设置API地址，则从服务器获取
  // 或者API无法使用时再从服务器获取
  if (null == api_address) {
    store.dispatch(getApiAddress('/config.json'));
  }
}
