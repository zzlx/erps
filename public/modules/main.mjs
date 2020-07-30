/**
 * *****************************************************************************
 *
 * 前端主程序
 *
 * 主要任务:
 *
 * * 集成UI及客户端路由
 * * 为UI程序提供store对象
 *
 *
 * Email: wangxuemin@zzlx.org
 * *****************************************************************************
 */

import UI from './views/index.mjs';
import callback from './callback.mjs';

const element = React.createElement(UI, {});

// 准备container
let container = window.document.getElementById('root');
if (null == container) {
  container = window.document.createElement('div');
  container.id = 'root';
  window.document.body.appendChild(container);
}

// 判断container是否存在服务端渲染的内容
// 需要使用hydrate方法合成页面
if (container.innerHTML) {
  ReactDOM.hydrate(element, container, callback);  
} else {
  ReactDOM.render(element, container, callback);  
}
