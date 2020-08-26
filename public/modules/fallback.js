/**
 * *****************************************************************************
 *
 * fallback
 * 用于web客户端不支持module时进行提示
 *
 * * 为获取最佳体验,请升级浏览器版本.
 * * @todo: 前端js模块打包后发布 
 *
 * *****************************************************************************
 */

let container = window.document.getElementById('root'); // get container

if (null == container) {
  container = window.document.createElement('div');
  container.id = 'root';
  window.document.body.appendChild(container);
}

const message = `浏览器不支持ES module,建议升级浏览器版本以获取最佳使用体验.`;
container.innerHTML = message; 
if (console && console.warn) console.warn(message);
