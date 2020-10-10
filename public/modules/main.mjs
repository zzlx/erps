/**
 * *****************************************************************************
 * 
 * 前端主程序
 * ==========
 *
 *
 *
 * *****************************************************************************
 */

import assert from './utils/assert.mjs';
import global from './utils/global.mjs';
import settings from './settings.mjs';
import App from './apps/App.mjs';
import configureStore from './store/configureStore.mjs';

try {
  assert(global.React, 'React is not available, please confirmed!');
  const preloadedState = global.__INITIAL_STATE__
  const store = configureStore(preloadedState); 
  const element = App(store);

  // @todo:客户端类型识别算法
  //
  // 浏览器网络环境
  if (settings.protocol.substr(0,4) === 'http' && global.document) {
    import('./client/frontend-browser.mjs').then(m => {
      const render = m.default;
      render(element);
    });
  }

  // 浏览器本地环境 
  // 需要客户端路由逻辑适配本地环境
  if (settings.protocol === 'file:') {
    import('./client/browser.mjs').then(m => {
      const render = m.default;
      render(element);
    });
  }

  // @todo: native环境
  // @todo: wechat客户端环境
  // @todo: dingtalk客户端环境
  //

} catch (err) {
  console.error(err);
}
