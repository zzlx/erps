#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * 脚本管理程序
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import cp from 'child_process';
import os from 'os';
import path from 'path';

import { assert, argvParser, } from '../src/utils.mjs';
import config from '../src/config/settings.mjs';

const paths = config.paths;
let httpd = null;

// Task_1: 检测系统平台类型
// 系统服务依赖于类unix系统环节, 在非unix环境中无法正常提供服务
assert(getOSPlatform() === 'unix-like', `Run in unix-like platform.`);

// Task_2: 执行程序
process.nextTick(() => executer()); 

/**
 * Utility functions 
 *
 */

function executer () {
  // Task: Parse argvs
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 处理环境变量配置 
  for (let param of paramMap.keys()) { 
    switch(param) { 
      case 'env': 
        config.env = paramMap.get('env');
        paramMap.delete(param); // delete param key
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        paramMap.delete(param); // delete param key
        continue;
      //default:
    }
  }

  if (paramMap.size == 0) console.log('There is nothing to do./@todo: Show help message.');

  // execute tasks
  for (let param of paramMap.keys()) {
    switch(param) {
      case 'help':
        //showHelp();
        paramMap.delete(param); // delete param key
        break;
      case 'start':
        paramMap.delete(param); // delete param key
        startHttpd();
        break;
      case 'stop':
        paramMap.delete(param); // delete param key
        stopHttpd();
        break;
      case 'restart':
        paramMap.delete(param); // delete param key
        restartHttpd();
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}

function startHttpd () {
  const args = [ path.join(paths.appRoot, 'services', 'http2d.mjs') ];
  const options = {
    detached: process.env.NODE_ENV === 'production' ? true : false,
    stdio: [0, 1, 2],
  };

  httpd = cp.spawn('node', args, options);
}


function stopHttpd () {
  let pid = null;
  if (httpd !== null) pid = httpd.pid;
  else pid = getPidByPort(config.system.port);

  if (pid) cp.execSync(`kill -9 ${pid}`);
}

function restartHttpd () {
  stopHttpd();
  startHttpd();
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
