/**
 * *****************************************************************************
 *
 * Process handler
 * ===============
 *
 * 进程管理
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import config from './config/default.mjs';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const debug = util.debuglog('debug:processHandler.mjs');
const paths = config.paths;
const pidFile = path.join(paths.appHome, `${process.title}.pid`);

// Task: caught exceptions
// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (err, origin) => {
	debug('Exception: %o', err);
	debug('Origin exception: %o', origin);
});

// Task: caught rejections
// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
	debug('unhandledRejection: %o', reason);
});

// Task: signal events
process.on('SIGHUP', () => {
  process.exit();
});

let sigintCount = 0; // SIGINT计数器

process.on('SIGINT', function (code) {
  console.log(code);

  if (sigintCount >= 0) {
    process.exit(1); // 结束进程
  } else {
    sigintCounudon++;
    console.log('Press Control-C twice to exit.');
  }
});

// 被重定向时触发进程信号
process.on('SIGPIPE', (code) => {
	debug('Received SIGPIPE');
})

// Set beforeExit event handler
process.on('beforeExit', (code) => {
  //
});

// Set exit event handler
process.on('exit', (code) => { 
  deletePidFile();
  debug(`${process.title}(PID:${process.pid}) is exit.`);
});

/**
 * Utility functions
 *
 */

function createPidFile () {
  return fs.promises.writeFile(pidFile, String(process.pid), 'utf8').catch(err => { 
    debug('write pid file error: ', err); 
  });
}

function deletePidFile () {
  // 定义删除pidFile函数
  fs.promises.unlink(pidFile).then(() => {
    debug(`delete ${pidFile} success.`);
  }).catch((err) => {
    debug(`delete ${pidFile} failure. reason:`, err);
  }); 
}
