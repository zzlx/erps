/**
 * *****************************************************************************
 * 
 * 前端应用程序
 * ============
 *
 * > ##### 注意:
 * > 此目录下源码模块在部署前端程序时会暴露于网络，请勿存放敏感数据.
 *
 * *****************************************************************************
 */

const dirname = p => p.substr(0, p.lastIndexOf('/'));
const url = new URL(import.meta.url);
const baseURI = dirname(url.href);   
const isBrowser = globalThis.document && typeof document === 'object';
const isNative = false;
const isNode = globalThis.process && typeof process.cwd === 'function';
if (!(isBrowser ^ isNode)) throw new Error('Environment detect error');

// 前端程序执行环境配置
globalThis.env = isBrowser 
  ? url.searchParams.get('env') || 'production' 
  : isNode 
    ? process.env.NODE_ENV || 'production' 
    : 'production';

/**
 * 前端主程序
 *
 */

(async function main () {
  if (isNode) globalThis.React = await import('react').then(m => m.default);
  const createStore = await import('./store.mjs').then(m => m.default);
  const App = await import('./containers/index.mjs').then(m => m.default);

  const store = createStore();

  // 订阅更新
  store.subscribe(() => {
  })

  // 注册浏览器全局事件
  if (isBrowser) {
    // 对比浏览器与location
    const currentLocation = window.location;
    const { location } = store.getState({ location: 1 });
    if (currentLocation.pathname !== location.pathname) {
      store.dispatch({
        type: 'HISTORY_PUSH_STATE', 
        pathname: currentLocation.pathname
      });
    }
    //window.addEventListener('');
  }

  // 前端程序执行环境配置
  if (isBrowser) browserRender(App(store)); // 浏览器客户端渲染
  if (isNode) nodeRender(store);  // Node环境下渲染
})().catch(console.error)

/**
 * Browser client render method
 *
 * @params {object} iniatialState 初始状态值
 */

function browserRender (element) {
  // 存在服务端渲染等页面使用hydrate方法渲染
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  const container = getElementById('root');
  if (container.innerHTML) ReactDOM.hydrate(element, container, renderCallback);
  else ReactDOM.render(element, container, renderCallback);  
}

/**
 * Native app render method
 *
 */

function nativeRender () {

}

/**
 * Node render method
 *
 * Node渲染时需要传入路径信息
 */

function nodeRender () {

}

/**
 * 渲染回调函数
 */

function renderCallback () {
  console.groupCollapsed('系统提示:');
  console.info('前端程序已就绪!');
  console.groupEnd();
}

/**
 * 获取element,如不存在则创建并附加至body
 */

function getElementById (id) {
  let element = window.document.getElementById(id);

  if (null == element) {
    element = window.document.createElement('div');
    element.id = id;
    window.document.body.appendChild(element);
  }

  return element;
}
