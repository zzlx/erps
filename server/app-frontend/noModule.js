/**
 * *****************************************************************************
 *
 * 当端客户端不支持module时提示更好客户端
 *
 * *****************************************************************************
 */

const ua = window.navigator.userAgent;
const message = /MSIE/.test(ua) 
  ? '前端UI程序不支持IE浏览器, 推荐使用Edge浏览器继续访问!\n'
  : '当前浏览器不支持ES Module，请升级或更换至最新版本浏览器重试.\n';

// 控制台打印提示信息
if (console.warn) console.warn(message);

// 页面显示提示信息
if (document && 'function' === typeof document.createElement) {
  const preContainer = document.createElement('pre');
  preContainer.innerHTML = message;
  document.body.prepend(preContainer);
}
