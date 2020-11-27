/**
 * *****************************************************************************
 * 
 * 浏览器DOM渲染程序
 *
 * @param {object} element reactElement
 * @param {string} id container id
 * *****************************************************************************
 */

export default function render (element, id, cb = () => {}) {
  if (window == null) return console && console.error('Unknown environment.');

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = window.document.getElementById(id);

  if (null == container) {
    container = window.document.createElement('div');
    container.id = id;
    window.document.body.appendChild(container);
  }

  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}
