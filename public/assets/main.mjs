/**
 * *****************************************************************************
 * 
 * 前端主程序
 *
 * 根据执行环境执行相应程序
 *
 *
 * *****************************************************************************
 */

import settings from './settings.mjs';
import configureStore from './store/configureStore.mjs';
const preloadedState = globalThis.__INATIAL__STATE__ || {};
const store = configureStore(preloadedState); 


(async function main () {
  globalThis.React = globalThis.React || await import('React').then(m => m.default);
  const App = await import('./apps/pages.mjs').then(m => m.default); 
  const element = App(store);

  // @todo:客户端类型识别算法
  //
  // 浏览器环境
  // 需要客户端路由逻辑适配本地环境
  if (settings.isBrowser) {
    return import('./client/frontend-browser.mjs').then(m => {
      const render = m.default;
      render(element);
    });
  } else {
    console.log('用于非浏览器环境');
  }

  // @todo: native环境
  // @todo: wechat客户端环境
  // @todo: dingtalk客户端环境
  //
})();

