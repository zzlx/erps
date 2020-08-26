/**
 * *****************************************************************************
 *
 * ERPSD(ERP Services Daemon)
 *
 *
 * # Usage:
 *
 * ```sh
 * erpsd.mjs --help
 * ```
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import zlib from 'zlib';

import sass from 'node-sass';

import config from './config.mjs';
import parseArgvs from './utils/parseArgvs.mjs';

// @todo: 服务器端渲染支持
import { HTMLRender } from './utils.mjs';

const __filename = import.meta.url.substr(7);
const FILE_NAME = path.basename(__filename, path.extname(__filename));
const paths = config.paths;
const pidFile = paths.pidFile;

const debug = util.debuglog(`debug:${path.basename(__filename)}`);

// Task: Set process title
process.title = `org.zzlx.${FILE_NAME}`;

// Task: Set NODE_ENV, default value is production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let http2server = null;

// record pid to pidFile
function recordPid () {
  return fs.promises.writeFile(pidFile, String(process.pid), 'utf8').catch(err => { 
    debug('write pid file error: ', err); 
  });
}

// Task: caught exceptions
// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (err, origin) => {
	debug('exception: %o', err);
	debug('origin: %o', origin);
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
  // 定义删除pidFile函数
  fs.promises.unlink(pidFile).then(() => {
    debug(`delete ${pidFile} success.`);
  }).catch((err) => {
    debug(`delete ${pidFile} failure. reason:`, err);
  }); 

  debug(`${process.title}(PID:${process.pid}) is exit.`);
});

/**
 * Define functions
 *
 */

function getPid () {
  let pid = null;
  let pidFromFile = null;
  let pidFromPort = null;

  if (fs.existsSync(pidFile)) {
    pidFromFile = fs.readFileSync(pidFile, 'utf8');
  }

  // 仅在unix环境下有效
  pidFromPort = cp.execSync(`lsof -i:${config.server.port} | awk \'NR==2{print $2}\'`).toString('utf8');

  if (pidFromPort) pid = pidFromPort

  return pid;
}

function restart () {
  debug('%s is restarting...', process.title);
  if (getPid() == '' || getPid() == null) {
    console.log(`${process.title} is not started, use '--start' have a try.`);
    start();
    return;
  }

  stop();
  start();
}

function stop () {
  if (http2server == null) {
    // check pid process
    const pid = getPid();
    if (pid) cp.execSync(`kill -9 ${pid}`);
    return;
  }

  http2server.close();
}

async function start () {
  // Task1: 构建styles.css
  // 启动时均重建styles.css文件,以保证代码最新
  await sass.render({
    file: config.paths.scssEntryPoint,
    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed': 'nested',
  }, (err, result) => {

    return Promise.all([
      fs.promises.writeFile(paths.stylesCss, result.css),
      fs.promises.writeFile(paths.stylesCss + '.br', zlib.brotliCompressSync(result.css)),
    ]);
  });

  // Task2: 生成index.html文件
  await new Promise((resolve, reject) => {
    const html = new HTMLRender().setTitle('Home').render();

    fs.promises.writeFile(paths.templateHtml, html).then(()=> {
      resolve();
    }).catch(err => { reject(err); });
  });

  // Task3: 拷贝react、react-dom
  await Promise.all([
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react-dom', 
        'umd', 
        `react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js`),
    ), 
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react', 
        'umd', 
        `react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js`),
    ), 
  ]);

  // get hostname
  //const hostname = cp.execSync("hostname | awk '{printf $1}'");
  const hostname = os.hostname();

  http2server = await import(config.paths.mainApp).then(m => m.default);

  // after the server started successfully, record pid to pidfile.
  http2server.on('listening', function () {
    recordPid().catch((err) => debug(err));
  });

  http2server.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: config.server.host,
    port: config.server.port,
    exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
  });
}

// Task: Parse argvs
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
    case 'stop':
      stop();
      break;
    case 'start':
      start();
      break;
    case 'restart':
      restart();
      break;
  }
}
