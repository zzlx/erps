/**
 * *****************************************************************************
 *
 * Main program
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

// 异步载入前端App
const AppModule = import('./ReactApp.mjs');

const preloadState = (window && window.localStorage)  
  ? window.localStorage.getItem('anonymous')
    ? JSON.parse(window.localStorage.getItem('anonymous')) 
    : Object.create(null)
  : Object.create(null);

const store = configureStore(preloadState); 

// 客户端存储数据
store.subscribe(() => {
  if (window) {
    window.localStorage.setItem('anonymous', JSON.stringify(store.getState()));
  }
});

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

AppModule.then(m => {
  const App = m.default;

  const element = App(store);

  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  //
  if (isServerRendered) {
    ReactDOM.hydrate(element, container, callback);
  } else {
    ReactDOM.render(element, container, callback);  
  }
});

function callback () {
  if (env && env !== 'production') {
    if (console && console.warn) console.warn(`当前为${env}环境.`); 
  }

  if (console && console.info) {
    console.info(`UI程序已就绪, 如遇使用问题请联系管理员. Email: wangxuemin@zzlx.org.`);
  }
}
