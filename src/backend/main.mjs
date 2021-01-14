/**
 * *****************************************************************************
 * 
 * ERP services daemon
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cluster from 'cluster';
import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import zlib from 'zlib';

import { argvParser, console, } from './utils.lib.mjs';
import debuglog from './utils/debuglog.mjs';
import settings from './settings.mjs';
import Http2Server from './server/Http2Server.mjs';
import PathWatcher from './utils/PathWatcher.mjs';

const debug = debuglog('debug:erps-daemon');
let httpd = null; // http daemon 

// 服务重启时执行的任务清单:
const tasksBeforeListen = [
  path.join(settings.paths.BIN, 'copy-umd-to-assets.mjs'),
  path.join(settings.paths.BIN, 'scss-render.mjs'),
];

/**
 * *****************************************************************************
 *
 * Utilities
 *
 * *****************************************************************************
 */

/**
 * 根据参数执行命令
 */

export default function main (argvs) {
  const paramMap = argvParser(argvs);

  // 处理环境变量配置 
  for (let param of Object.keys(paramMap)) { 
    switch(param) { 
      case 'env': 
        process.env.NODE_ENV = paramMap['env'];
        delete paramMap['env'];
        continue;
      //default:
    }
  }

  if (paramMap.size == 0) {
    console.log('There is nothing to do./@todo: Show help message.');
  }

  for (let param of Object.keys(paramMap)) {
    switch(param) {
      case 'help':
        //showHelp();
        delete paramMap['help'];
        break;
      case 'start':
        start();
        delete paramMap['start'];
        break;
      case 'stop':
        stop();
        delete paramMap['stop'];
        break;
      case 'restart':
        restart();
        delete paramMap['restart'];
        break;
    }

    if (Object.keys(paramMap).length > 0) {
      console.log('The param: %o is not supported.', paramMap);
    }
  }
}

function start () {
  if (httpd == null) {
    httpd = new Http2Server({
      key: settings.privateKey,
      cert: settings.cert,
      passphrase: settings.passphrase, // 证书passphrase
      ticketKeys: crypto.randomBytes(48), 
    });
  }

  httpd.listen(() => {
    consolePrint(() => {
      //console.clearLine(12);
      //console.clear();
      console.divideLine();
      console.log('服务器监控信息: ')
      console.divideLine('-');
      console.log({
        '进行编号': process.pid,
        '运行模式': process.env.NODE_ENV,
        '系统平台': process.platform + '_' + process.arch,
        '处理器信息': os.cpus()[0].model + ' * ' + os.cpus().length,
        '内存总量': Number(settings.system.totalmem)/1024/1024/1024 + 'G',
        '空闲内存': Number(settings.system.freemem/1024/1024).toFixed(2) + 'M',
        '监听地址': httpd.server.address(),
        '连接计数': httpd.connections,
        '错误计数': httpd.errors,
      });
      console.divideLine();
    });
  });

  if (process.env.NODE_ENV === 'development') {
    const watcher = new PathWatcher({ paths: ['bin', 'src'] });
    let clearTimeout = null;

    // 注册变动事件
    watcher.on('change', (file) => {
      if (typeof clearTimeout === 'function') { 
        clearTimeout();
        clearTimeout = null;
      }

      clearTimeout = setTimeout(() => {
        httpd.close(() => {
          console.log('服务器已关闭');
        });
      }, 500);
    });

    watcher.begin(); // 开始监控
  }
}

/**
 * 控制台打印
 */

function consolePrint (cb, realTime = false) {
  if (realTime) setInterval(cb, 1000);
  else cb();
}

function stop () {
  const port = settings.system.port;
  const pid = getPidByPort(port);
  if (pid) cp.execSync(`kill -9 ${pid}`);
}

function restart () {
  stop();
  start();
}

function useCluster () {
  const numCPUs = os.cpus().length;

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    // 使用一半cpu执行任务
    for (let i = 0; i < Math.round(numCPUs/2); i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

  } else {

    console.log(`Worker ${process.pid} started`);
  }
}

function getOSPlatform () {
  let platform = null;

  switch (os.platform()) {
    case 'aix': 
    case 'darwin': 
    case 'freebsd': 
    case 'linux': 
    case 'openbsd': 
    case 'sunos': 
      platform = 'unix-like';
      break;
    case 'win32': 
    case 'win64': 
      platform = 'win';
      break;
    default:
      platform = 'unknown';
  }

  return platform;
}

/**
 * 根据port查询服务进程ID
 *
 * @param {string|number}
 * @return {string} 
 */

function getPidByPort (port) {
  return cp.execSync(`lsof -i:${port} | grep 'LISTEN' \
    | awk \'NR==1{print $2}\'`
  ).toString('utf8');
}

function cssRender () {
  const cssFile = path.join(
    settings.paths.PUBLIC, 
    'assets', 
    'css', 
    path.basename(scssEntryPoint, '.scss') + '.css',
  );
  const cssFileDeflate = cssFile + '.deflate';
  const cssFileBr = cssFile + '.br';
  const cssFileGz = cssFile + '.gz';


  /*
        // 保证目标文件的目录已经准备就绪
        fs.mkdirSync(path.dirname(cssFile), {recursive: true}); 
  const tasks = Promise.all([
    fs.promises.writeFile(cssFile, result.css),
    fs.promises.writeFile(cssFileGz, zlib.gzipSync(result.css)),
    fs.promises.writeFile(cssFileBr, zlib.brotliCompressSync(result.css)),
    fs.promises.writeFile(cssFileDeflate, zlib.deflateSync(result.css)),
  ].filter(Boolean));
*/
}
