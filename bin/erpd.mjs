#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * ERP Service Daemon
 *
 * ERP服务后台管理程序(ERP Services Daemon, ERPSD),
 * 用于管理ERP各项服务的启动、关闭、重启等任务.
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import cp from 'child_process';
import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import util from 'util';

import settings from '../server/config/settings.mjs';
import { 
  assert, 
  argvParser, 
  console, 
} from '../src/utils.lib.mjs';

const paths = settings.paths;
const debug = util.debuglog('debug:httpd.mjs');

process.title = 'erpd';

process.nextTick(() => {
  // 检测系统平台类型
  // 系统服务依赖于类unix系统环节, 在非unix环境中无法正常提供服务
  assert(getOSPlatform() === 'unix-like', `Run in unix-like platform.`);
  executer();
}); 

/**
 * 根据参数执行命令
 */

function executer () {
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 处理环境变量配置 
  for (let param of Object.keys(paramMap)) { 
    switch(param) { 
      case 'env': 
        settings.env = paramMap['env'];
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

async function start () {
  const serverApp = path.join(paths.SERVER, 'main.mjs');
  const server = await import(serverApp).then(m => m.default);
  server.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: settings.system.ipv6 ? '::' : '0.0.0.0',
    port: settings.system.port,
    exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
  });
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
