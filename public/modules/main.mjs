/**
 * *****************************************************************************
 *
 * 前端渲染主程序
 *
 * 渲染逻辑:
 * 1. 判断是否存在服务端渲染内容
 *
 * *****************************************************************************
 */

import App from './views/index.mjs';

const element = React.createElement(App,null);
let container = window.document.getElementById('root');

if (null == container) {
  container = window.document.createElement('div');
  container.ip = 'root';
  window.document.body.appendChild(container);
}

if (container.innerHTML) {
  ReactDOM.hydrate(element, container, callback);  
} else {
  ReactDOM.render(element, container, callback);  
}

function callback () {
  console.log('前端程序已就绪.');

  // Tasks:

}
