/**
 * *****************************************************************************
 * 
 * 前端主程序
 * ==========
 *
 * *****************************************************************************
 */

import settings from './settings.mjs';
import assert from './utils/assert.mjs';
import global from './utils/global.mjs';
import configureStore from './store/configureStore.mjs';

(async function main () {
  assert(global.React, 'React is not available, please confirmed!');
  const preloadedState = global.__INITIAL_STATE__
  const store = configureStore(preloadedState); 
  const App = await import('./containers/App.mjs').then(m => m.default);
  const element = App(store);

  // @todo:完善客户端类型识别算法
  //
  // 浏览器网络环境
  if (settings.protocol.substr(0,4) === 'http' && global.document) {
    return import('./client/browser.mjs').then(m => {
      const render = m.default;
      render(element);
    });
  }

  // 浏览器本地环境 
  // 需要客户端路由逻辑适配本地环境
  if (settings.protocol === 'file:') {
    return import('./client/browser.mjs').then(m => {
      const render = m.default;
      render(element);
    });
  }

  // @todo: native环境
  // @todo: wechat客户端环境
  // @todo: dingtalk客户端环境
  //

})().catch(console.error); // @todo: 无法追踪异步模块内部错误位置,给调试带来不便
