/**
 * *****************************************************************************
 * 
 * UI前端程序
 *
 * *****************************************************************************
 */

//import React 'react';
import DOMRender from './utils/DOMRender.mjs';
import ReactApp from './ReactApp.mjs';

// 准备执行环境
const appURL = new URL(import.meta.url);
const ua = window.navigator.userAgent;
if (/MSIE/.test(ua)) container.innerHTML = '请使用Edge浏览器继续访问!';
globalThis.env = appURL.searchParams.get('env') || 'production';

DOMRender(ReactApp(), 'root', callback); // 浏览器客户端渲染

function callback () {
  console.groupCollapsed('系统提示:');
  console.info('前端程序已就绪!');
  console.groupEnd();
  //getWebSocket(); // 开启websocket
}

/**
 * web socket client
 */

function getWebSocket () {
  const ws = new WebSocket(`wss://${appURL.host}/api/socket`);

  ws.onopen = (event) => {
    console.log('webSocket is connected.');
    this.send("Client: Hello!");
  };

  ws.onmessage = (e) => {
    if(typeof e.data === 'string') console.log("from server: ", e.data);

    if(e.data instanceof ArrayBuffer){
      const buffer = e.data;
      console.log("Received arraybuffer");
    }
  }

  ws.onclose = () => console.warn("Connection is closed.");

  return ws;
}

/**
 * Web Worker
 */

function getWebWorker () {
  self.addEventListener('message', function (e) {
    const data = e.data;

    switch (data.cmd) {
      case 'start':
        self.postMessage('WORKER STARTED: ' + data.msg);
        break;
      case 'stop':
        self.postMessage('WORKER STOPPED: ' + data.msg);
        self.close(); // Terminates the worker.
        break;
      default:
        self.postMessage('Unknown command: ' + data.msg);
    };
  }, false);
}
