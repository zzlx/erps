/**
 * *****************************************************************************
 *
 * Fallback 
 *
 * @Tips: 
 * 常用浏览器客户端均已支持ES Module, 推荐升级或更换浏览器版本.
 * 不再支持提供打包好的前端程序
 * *****************************************************************************
 */

const message = `当前浏览器信息: ${window.navigator.userAgent}
您的浏览器没有支持ES Module，建议升级或更换浏览器后再重新访问.`;
if (console && console.warn) console.warn(message);
const container  = window.document.createElement('pre').innerHTML = message;
window.document.body.prepend(container);
