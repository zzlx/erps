#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 服务启动器
 *
 * 进程执行完即退出
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import crypto from 'crypto';
import cp from 'child_process';
import os from 'os';
import path from 'path';
import util from 'util';
import zlib from 'zlib';

import { assert, argvParser, } from '../server/utils.mjs';
import config from '../config/default.mjs';

const paths = config.paths;
const state_cache = {}; // cache process state

// Task_1: 检测系统平台类型
assert(getOSPlatform() === 'unix-like', `Only can be run in unix-like platform.`)

// Task_2: 执行程序
process.nextTick(() => executer()); 

/**
 * *****************************************************************************
 *
 * Utility functions 
 *
 * > ##### 注意:ETags 
 * > 以下为此脚本工具用到的*功能函数* 
 *
 * *****************************************************************************
 */

function executer () {
  // Task: Parse argvs
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 
  for (let param of paramMap.keys()) { 
    switch(param) { 
      case 'env': 
        config.env = paramMap.get('env');
        process.env.NODE_ENV = config.env;

        paramMap.delete(param); // delete param key
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        paramMap.delete(param); // delete param key
        continue;
      //default:
    }
  }

  if (paramMap.size == 0) console.log('There is nothing to do.');

  // execute tasks
  for (let param of paramMap.keys()) {
    switch(param) {
      case 'help':
        //showHelp();
        paramMap.delete(param); // delete param key
        break;
      case 'stop':
        paramMap.delete(param); // delete param key
        stop();
        break;
      case 'start':
        paramMap.delete(param); // delete param key
        start();
        break;
      case 'restart':
        paramMap.delete(param); // delete param key
        restart();
        break;
      case 'watcher':
        paramMap.delete(param); // delete param key
        watcher();
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}

function watcher () {
  console.log('开启监听...');
  watchPath(
    path.join(paths.appRoot, 'server'),
    path.join(paths.appRoot, 'styles'),
    () => {
      console.log('重启服务');
      restart();
    }
  );
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

function stop () {
  if (http2server == null) {
    // check pid process
    const pid = getPid();
    if (pid) cp.execSync(`kill -9 ${pid}`);
    return;
  }

  http2server.close(() => {
    debug('Server is closed.');
  });
}

// boundler
function copyReactModule () {
  // Task3: 拷贝react、react-dom
  return Promise.all([
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react-dom', 
        'umd', 
        `react-dom.${config.env === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react-dom.${config.env === 'development' ? 'development' : 'production.min'}.js`),
    ), 
    fs.promises.copyFile(
      path.join(
        paths.nodeModules, 
        'react', 
        'umd', 
        `react.${config.env === 'development' ? 'development' : 'production.min'}.js`),
      path.join(
        paths.public, 
        'statics', 
        `react.${config.env === 'development' ? 'development' : 'production.min'}.js`),
    ), 
  ]);
}

