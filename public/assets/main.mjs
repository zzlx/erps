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
import App from './pages/index.mjs';

const preloadedState = globalThis.__INATIAL__STATE__ || {};
const element = App(preloadedState);

// @todo:客户端类型识别算法
//
// 浏览器环境
// 需要客户端路由逻辑适配本地环境
if (settings.isBrowser) {
  import('./browser-client.mjs').then(m => m.default).then(render => {
    render(element);
  });
} else {
  console.log('目前仅支持浏览器客户端环境!');
}

// @todo: native环境
// @todo: wechat客户端环境
// @todo: dingtalk客户端环境
