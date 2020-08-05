/**
 * *****************************************************************************
 *
 * 前端主程序
 *
 * * 集成前端UI视图及客户端路由
 * * store状态管理
 * * 判断是否存在服务器端渲染内容,使用响应render方法
 * * 执行渲染完成后任务
 *
 * *****************************************************************************
 */

import Provider from './components/Provider.mjs';
import Switcher from './Switcher.mjs';
import routes from './routes.mjs';
import store from './store/index.mjs';

// get element 
const element = React.createElement(Provider, {
  store: store
}, React.createElement(Switcher, { routes }));

// get container
let container = window.document.getElementById('root');

// null container
if (null == container) {
  container = window.document.createElement('div');
  container.id = 'root';
  window.document.body.appendChild(container);
}

// add className to container
container.classList.add('d-flex', 'flex-column', 'w-100', 'h-100', 'mx-auto');

// render optional
if (container.innerHTML) {
  // 判断container是否存在内容，服务端渲染后会
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  // 使用hydrate方法合成页面
  ReactDOM.hydrate(element, container, callback);  
} else {
  // 在空的容器对象上渲染
  ReactDOM.render(element, container, callback);  
}

function callback () {
  console.info(
    `UI程序已就绪,使用过程中如遇到问题,请通知系统管理员. 
Email: wangxuemin@zzlx.org.`
  );

  if (env && env === 'development') console.warn(`当前环境为: ${env}.`); 
}
