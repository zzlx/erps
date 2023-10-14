/**
 * *****************************************************************************
 *
 * 前端入口程序
 * ===========
 *
 * 用于在客户端渲染用户程序
 *
 * > 注意:
 * > 此目录中源代码公开,不能存放用户信息等敏感数据
 *
 * *****************************************************************************
 */

import ReactDOM from "./components/ReactDOM.mjs";
import App from "./App.mjs";
import { deviceDetect } from "./utils/deviceDetect.mjs";
import { debuglog } from "./utils/debuglog.mjs";

// 配置环境变量: 从模块文件url中获取env,未获取到时默认为production
globalThis.env = new URL(import.meta.url).searchParams.get("env") || "production";
const isNativeEnv = false;
const isBrowserEnv = globalThis.window && globalThis.location;
const debug = debuglog("debug:index");

// Fix the client render warnings 
ReactDOM.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.usingClientEntryPoint = true;

export default App;

if (isNativeEnv) {
  // Render in native environment.
  debug("注意:Native环境中渲染前端程序.");
  
} else if (isBrowserEnv) {
  // Render in browser client environment.
  const ua = navigator.userAgent;
  const d = deviceDetect(ua);

  printHelloWorld(
    "欢迎使用前端UI系统!🎉💐", 
    `帮助文档: ${location.origin}/docs
当前系统处于持续开发中,如遇使用问题可直接联系开发者.
当前浏览器: ${d.browser}
当前操作系统: ${d.device}`,
  );

  // const html = document.getElementsByTagName("html")[0];

  // 初始化状态数据
  const initialState = Object.assign({}, {
    location: {
      pathname: location.pathname,
    },
  }, window.__PRELOADED_STATE__);

  // 存在服务端渲染等页面使用hydrate方法渲
  // 空的容器对象上使用render方法渲染
  // 判断container是否存在服务端渲染内容
  // 判断方法需要补充完善一下,要能识别到服务端渲染的标记
  let container = document.getElementById("app");

  if (null == container) {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);
  }

  const el = App(initialState);

  if (container.innerHTML) {
    ReactDOM.hydrateRoot(container, el);
  } else {
    const root = ReactDOM.createRoot(container);
    root.render(el);
  }
} else {
  debug("未知环境,无法渲染前端程序...");
}

/**
 * print hello word
 */

export function printHelloWorld () {
  const args = Array.prototype.slice.call(arguments);
  const hw = args.shift(); // 第1个参数为 hello word

  console.groupCollapsed(hw); // eslint-disable-line
  console.log.apply(null, args); // eslint-disable-line
  console.groupEnd(); // eslint-disable-line
}
