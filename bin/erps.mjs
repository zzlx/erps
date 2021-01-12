#!/usr/bin/env node --trace-warnings
/**
 * *****************************************************************************
 * 
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

import { argvParser, console, } from '../src/utils.lib.mjs';
import settings from '../src/settings/index.mjs';
import Http2Server from '../src/server/Http2Server.mjs';

let httpd = null; // http daemon 

// 服务重启时执行的任务清单:
const tasksBeforeListen = [
  path.join(settings.paths.BIN, 'copy-umd-to-assets.mjs'),
  path.join(settings.paths.BIN, 'scss-render.mjs'),
];

process.nextTick(() => {
  // 检测系统平台类型
  // 系统服务依赖于类unix系统环节, 在非unix环境中无法正常提供服务
  assert(getOSPlatform() === 'unix-like', `Run in unix-like platform.`);
  main();
}); 

/**
 * 根据参数执行命令
 */

function main () {
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 处理环境变量配置 
  for (let param of Object.keys(paramMap)) { 
    switch(param) { 
      case 'env': 
        process.env.NODE_ENV = paramMap['env'];
        delete paramMap['env'];
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        delete paramMap['debug'];
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

  httpd.listen({
    ipv6Only: false,
    host: settings.system.ipv6 ? '::' : '0.0.0.0',
    port: settings.system.port || '8888',
    exclusive: false,
  }, () => {
    consolePrint(() => {
      //console.clearLine(12);
      console.clear();
      console.divideLine();
      console.log('服务器监控信息: ')
      console.divideLine('-');
      console.log({
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
