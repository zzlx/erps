/**
 * *****************************************************************************
 *
 * Nomodule Fallback
 *
 * 当前端客户端不支持module时进行提示
 *
 * *****************************************************************************
 */


var message = '当前浏览器不支持ES Module，请升级或更换至最新版本浏览器重试.\n';
var ua = window.navigator.userAgent;

if (/MSIE/.test(ua)) {
  message = 'IE浏览器不支持新版前端应用程序, 推荐使用Edge浏览器继续访问!\n';
}

// 控制台打印提示信息
if (console.warn) console.warn(message);

// 页面显示提示信息
if (document && 'function' === document.createElement) {
  var preContainer = document.createElement('pre');
  preContainer.innerHTML = message;
  document.body.prepend(preContainer);
}
