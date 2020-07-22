/**
 * *****************************************************************************
 *
 * ERPSD(ERP Services Daemon)
 *
 * ## Tasks:
 *
 * * restart service
 * * start service
 * * stop service
 *
 * ## Process
 *
 * process control
 * exception
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import parseArgvs from './utils/parseArgvs.mjs';

const __filename = import.meta.url.substr(7);
const ROOT_PATH = path.dirname(path.dirname(__filename));
const FILE_NAME = path.basename(__filename, path.extname(__filename));

const debug = util.debuglog(`debug:${FILE_NAME}`);

// Task: Set process title
process.title = `org.zzlx.${FILE_NAME}`;

// Task: Set NODE_ENV, default value is production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let http2server = null;

// Task: Save pid number to pid file. 
const pidFile = path.join(os.homedir(), '.erps', `${process.title}.pid`);

if (fs.existsSync(pidFile)) {
  const pid = fs.readFileSync(pidFile);

  try {
    process.kill(pid, 0);
  } catch (e) {
    debug(e);
  }
}

fs.promises.writeFile(pidFile, String(process.pid), 'utf8').catch(err => {
  debug('write pid file error: ', err);
});

// Task: caught exceptions
// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (err, origin) => {
	debug('exception: ', err);
	debug('origin: ', origin);
});

// Task: caught rejections
// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
	debug('rejection reason: ', reason);
	debug('promise: ', promise);

  restart();
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
  // 定义删除pidFile函数
  fs.promises.unlink(pidFile).then(() => {
    debug(`delete ${pidFile} success.`);
  }).catch((err) => {
    debug(`delete ${pidFile} failure. reason:`, err);
  }); 
});

/**
 * Define functions
 *
 */

function detectPidProcess () {
  let pid = null;

  if (fs.existsSync(pidFile)) {
    pid = fs.readFileSync(pidFile, 'utf8');
    console.log(pid);


  }
}

function restart () {
  debug('Restart service...');

  // check pid process
  detectPidProcess();
}

async function start () {
  // get hostname
  //const hostname = cp.execSync("hostname | awk '{printf $1}'");
  const hostname = os.hostname();

  const HttpServer = await import('./HttpServer.mjs').then(m => m.default);
  const httpServer = new HttpServer();

  httpServer.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
    exclusive: false, // false 可接受进程共享端口
  });
}

// Task: Parse argvs
//
const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
const paramMap = parseArgvs(ARGVS);

// 
for (let param of paramMap.keys()) { 
  switch(param) { 
    case 'env': 
      process.env.NODE_ENV = paramMap.get('env');
      paramMap.delete(param); // delete param key
      continue;
    case 'debug':
      process.env.NODE_DEBUG = 'debug:*';
      paramMap.delete(param); // delete param key
      continue;
    //default:
  }
}

if (paramMap.size == 0) {
  console.log('Must provide a paramater');
}

// execute tasks
for (let param of paramMap.keys()) {
  switch(param) {
    case 'help':
      //showHelp();
      break;

    case 'start':
      start();
      break;
    case 'restart':
      restart();
      break;
  }
}
