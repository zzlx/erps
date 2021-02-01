/**
 * *****************************************************************************
 *
 * UI Application.
 *
 * *****************************************************************************
 */

//Detect environment and render UI Application
const global = getGlobal();
const __url = new URL(import.meta.url);
global.env = __url.searchParams.get('env') || 'production';

import('./app.mjs').then(m => m.default).then(app => {
  const element = app({ location});
  render(element);
});

/**
 * *****************************************************************************
 *
 * Utility functions
 *
 * *****************************************************************************
 */

function render (element) {
  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = document.getElementById('root');

  if (null == container) {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  }

  if (container.innerHTML) ReactDOM.hydrate(element, container, cb);
  else ReactDOM.render(element, container, cb);  
}

/**
 * callback function
 */

function cb () {
  const device = deviceDetect(window.navigator.userAgent);
  console.groupCollapsed('欢迎使用前端UI程序!');
  if (device) console.log(`检测到当前客户端设备为:${device}`);
  else console.warn('未检测出当前设备类型😢');
  //console.log(`帮助文档: ${location.origin}/documentation`);
  console.groupEnd();
}

/**
 * 通知
 *
 * 注意使用场合
 */

function notification () {
  if (window && window.Notification == null) return;
  Notification.requestPermission(); // 获取授权

  const notification = new Notification('新消息', {
    body: `数据已经准备就绪请查看`,
    silent: false, // 通知出现是否提示音
    //sound: '', // 定义通知出现时的声音资源
    icon: 'https://avatars2.githubusercontent.com/u/15223841?s=96&v=4'
  });

  notification.onclick = (event) => {
    window.open('/notice', 'test');
    window.focus();
    notification.close();
  };
}

/**
 * 根据提供的ua字符串,解析出设备、浏览器客户端类型
 */

export default function deviceDetect (ua) {
  let device = null;
  //if (/MSIE/.test(ua)) .innerHTML = '请使用Edge浏览器继续访问!';

  if (/iPhone;/.test(ua)) {
    device = 'iPhone';
  } else if (/iPad;/.test(ua)) {
    device = 'iPad';
  } else if (/Android/.test(ua)) {
    device = 'android';
  } else if (/Intel Mac OS X/.test(ua)) {
    device = 'Mac';
  } else if (/Windows NT/.test(ua)) {
    device = 'Windows';
  }

  return device;
}

/**
 * 获取环境global对象
 */

export function getGlobal () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  if (typeof global !== 'undefined') return global;
  return Object.create(null);
}
