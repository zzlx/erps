/**
 * *****************************************************************************
 *
 * Background Tasks
 *
 * 执行后台任务,前端UI可以不受影响
 *
 * *****************************************************************************
 */

//importScripts('script1.js'); // 加载脚本

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
