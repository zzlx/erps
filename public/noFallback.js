/**
 * *****************************************************************************
 *
 * Fallback 提示信息
 *
 * *****************************************************************************
 */

const message = `
当前客户端浏览器信息: ${window.navigator.userAgent}
常用浏览器均已支持Module, 不提供fallback支持,建议升级或更换浏览器后再重试.
`;
const container  = window.document.createElement('pre');
container.innerHTML = message;
window.document.body.prepend(container);
