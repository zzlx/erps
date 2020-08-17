/**
 * *****************************************************************************
 *
 * 客户端主程序
 *
 * 将前端UI程序渲染至客户端浏览器DOM
 *
 * * 判断是否存在服务器端渲染内容,使用响应render方法
 * * 执行渲染完成后任务
 *
 * *****************************************************************************
 */

import configureStore from './store/configureStore.mjs';

const preloadedState = window.__INITIAL_STATE__

// get container
let container = window.document.getElementById('root');

// null container
if (null == container) {
  container = window.document.createElement('div');
  container.id = 'root';
  window.document.body.appendChild(container);
}

// add className to container
// container.classList.add('d-flex', 'flex-column', 'w-100', 'h-100', 'mx-auto');

// 判断container是否存在服务端渲染内容
// 判断方法需要补充完善一下,要能识别到服务端渲染的标记
// algorithmic
const isServerRendered = container.innerHTML ? true : false;

import('./App.mjs').then(m => m.default).then(App => {
  const store = configureStore(preloadedState); 
  const element = App(store);

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  if (isServerRendered) {
    ReactDOM.hydrate(element, container, callback);
  } else {
    ReactDOM.render(element, container, callback);  
  }
});

/**
 * 前端渲染完成后提示系统信息
 */

function callback () {
  console.groupCollapsed('系统信息');
  console.info(`就绪时间: ${new Date()}`);

  if (globalThis.env && globalThis.env !== 'production') {
    console.info(`当前环境:${env}`);
  }

  console.info(`使用说明:${window.location.origin}/manual`);
  console.info(`联系我们: ${window.location.origin}/contact`);
  console.groupEnd();
}
