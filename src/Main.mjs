/**
 * *****************************************************************************
 * 
 * 系统服务主控程序
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import { fork, spawn } from 'child_process';
import net from 'net';
import tls from 'tls';
import http2 from 'http2';
import { 
  X509Certificate 
} from 'crypto';

import { 
  argvParser, 
  camelCase,
  console, 
} from './utils.lib.mjs';
import debuglog from './utils/debuglog.mjs';
import settings from './settings/index.mjs';

const debug = debuglog('debug:main');
let httpd = null;

/**
 * main控制程序: 接受并执行参数
 */

export default function main (argvs = process.argv.slice(2)) {
  const paramMap = argvParser(argvs);

  // deal with environment variables
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
        startDaemon();
        break;
      case 'stop':
        isExec = true;
        sendCommand('STOP');
        break;
      case 'restart':
        isExec = true;
        sendCommand('RESTART');
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
 * *****************************************************************************
 *
 * Utilites
 *
 * *****************************************************************************
 */

/**
 *
 *
 */

function startDaemon () {
  const command = path.join(settings.paths.SRC, 'httpd.mjs');
  const args = [ command, ];
  const options = {
    detached: true,
    stdio: 'inherit',
    //stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  };

  httpd = spawn(process.argv[0], args, options);

  /*
  httpd.send('test');
  httpd.on('message', (m) => {
    debug(m);
  });
  */
}

/**
 *
 *
 */

function sendCommand (command) {
  const options = {
    host: settings.host,
    port: settings.port, 
    ca: settings.cert,
    checkServerIdentity: (hostname, cert) => { 
      return null;
    },
  };

  //const x509 = new X509Certificate(settings.cert);

  const socket = tls.connect(options, () => {
    if (socket.authorized) {
      const message = JSON.stringify({
        passphrase: settings.passphrase,
        command: command
      });

      socket.end(message);
    }
  });

  socket.on('error', e => {
    if (e.code === 'ECONNREFUSED') {
      console.log('服务访问被拒绝，请确认服务已经启动.');
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
/**
 * 显示帮助信息
 */

function showHelp () {
  process.stdout.write(
    `${console.divideLine()}
ERP服务器使用帮助
${console.divideLine('-')}
Usage: erps.mjs [options]

Options:
  -h, --help                  显示帮助信息
  -v, --version               显示版本信息
  --start                     启动服务
  --stop                      关闭服务
  --restart                   重启服务
${console.divideLine()}
`);
}

/**
 * 显示版本信息
 */

function showVersion () {
  console.log(settings.version);
}
