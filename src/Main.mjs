/**
 * *****************************************************************************
 * 
 * 系统服务主控程序
 *
 * 支持的服务协议
 *
 * * http2
 * * websocket
 * * ftp
 *
 * *****************************************************************************
 */

import fs from 'fs';
import { spawn } from 'child_process';
import { 
  argvParser, 
  camelCase,
  console, 
} from './utils.lib.mjs';
import debuglog from './utils/debuglog.mjs';
import settings from './settings/index.mjs';

const debug = debuglog('debug:main');

/**
 * main 
 *
 * @param {object} argvs
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
    }
  }

  let isExec = false; // 是否执行

  for (let param of Object.keys(paramMap)) {
    switch(param) {
      case 'h':
      case 'help':
        isExec = true;
        showHelp();
        break;
      case 'v':
      case 'version':
        isExec = true;
        showVersion();
        break;
      case 'start':
        isExec = true;
        //startDaemon();
        break;
      case 'stop':
        isExec = true;
        //emit('STOP');
        break;
      case 'restart':
        isExec = true;
        //emit('RESTART');
        break;
      default:
        isExec = true;
        console.log('The param "%s" is not supported.', param);
        break;
    }
  }

  if (isExec === false) startDaemon(); // 未提供参数时执行start
}

/**
 *
 *
 */

function startDaemon () {
  process.nextTick(() => {
    setInterval(() => {
      console.log('TEST');
    }, 1000);
  });
}

/**
 * 显示帮助信息
 */

function showHelp () {
  fs.promises.readFile(settings.paths.HELP).then(content => {
    process.stdout.write(content);
  });
}

/**
 * 显示版本信息
 */

function showVersion () {
  console.log(settings.packageJSON.version);
}

/**
 *
 *
 */

function exec () {
  const conn = net.connect({ port: Number(settings.system.port) + 1 }, () => {
    const message = JSON.stringify({
      token: 'test',
      command: command
    });

    conn.write(message);

    conn.on('data', chunk => {
      debug(chunk.toString());
      conn.end();
    });
  });

  conn.on('error', e => {
    if (e.code === 'ECONNREFUSED') {
      console.log('服务未启动，请先启动服务');
    }
  });
} 

/**
 *
 */

function setupProcess () {
  //process.title = settings.packageJSON.name;
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  process.on('exit', code => {
    const uptime = Math.ceil(process.uptime()*1000);
    debug(`${process.title} is running ${uptime}ms before exit.`);
  });

  process.on('uncaughtException', (error, origin) => {
    console.log(error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
  });
}
