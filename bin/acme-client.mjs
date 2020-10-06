#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * Http Daemon
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

import settings from '../server/settings.mjs';
import { 
  assert, 
  argvParser, 
  console 
} from '../server/utils.mjs';

const paths = settings.paths;
const debug = util.debuglog('debug:httpd.mjs');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('exit', code => {
  debug(`${process.title}(PID:${process.pid}) is exit with code ${code}.`);
});

// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.error('Caught exception: %o', error);
  console.error('Origin exception: %s', origin);
});

// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection: %o', reason);
});

process.nextTick(() => {
  // 检测系统平台类型
  // 系统服务依赖于类unix系统环节, 在非unix环境中无法正常提供服务
  assert(getOSPlatform() === 'unix-like', `Run in unix-like platform.`);
  executer()
}); 

/**
 * 根据参数执行命令
 */

function executer () {
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  // 处理环境变量配置 
  for (let param of paramMap.keys()) { 
    switch(param) { 
      case 'env': 
        settings.env = paramMap.get('env');
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
    console.log('There is nothing to do./@todo: Show help message.');
  }

  for (let param of paramMap.keys()) {
    switch(param) {
      case 'help':
        //showHelp();
        paramMap.delete(param); // delete param key
        break;
      case 'start':
        paramMap.delete(param); // delete param key
        break;
      case 'stop':
        paramMap.delete(param); // delete param key
        break;
      case 'restart':
        paramMap.delete(param); // delete param key
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}
