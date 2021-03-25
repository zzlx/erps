/**
 * *****************************************************************************
 * 
 * 主服务程序
 *
 * *****************************************************************************
 */

import assert from 'assert';
import { exec, execFile, fork, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import tls from 'tls';
import zlib from 'zlib';

import settings from './settings/index.mjs';
import debuglog from './debuglog.mjs';
import { argvParser } from './utils.lib.mjs';

const onMacOS =() => process.platform === 'darwin';
const onLinux =() => process.platform === 'linux';
const onWindows =() => process.platform === 'win32';

const debug = debuglog('debug:erps');
// Process container
const proc = { }; 

assert(onLinux(), 'Linux platrom is recomanded.');

// 主进程
process.title = 'org.zzlx.erpsd'; // 命名主进程

/*
let time = 0;

process.on('SIGINT', signal => {
  if (time >= 1) {
    return process.exit();
  }
  time++;
  console.log('Control + C twice to exit;');
});

process.on('SIGQUIT', signal => {
  process.exit();
});
*/

// 执行主程序
process.nextTick(() => {
  main();
});

/**
 * *****************************************************************************
 * Utility Functions
 * *****************************************************************************
 */

/**
 * 主控制程序
 *
 * 解析启动参数，执行命令任务
 */

function main (argvs = Array.prototype.slice.call(process.argv, 2)) {


  const paramMap = argvParser(argvs);

  // deal with environment variables
  for (let param of Object.keys(paramMap)) { 
    switch(param) { 
      case 'devel': 
      case 'development': 
        process.env.NODE_ENV = 'development';
        process.env.NODE_DEBUG = 'debug*';
        delete paramMap[param];
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
        start();
        break;
      case 'stop':

        isExec = true;
        //sendCommand('STOP');
        break;
      case 'restart':
        isExec = true;
        //sendCommand('RESTART');
        break;
      default:
        isExec = true;
        console.log('The param "%s" is not supported.', param);
        break;
    }
  }

 // if (isExec === false) start(); // 未提供参数时执行start
 if (isExec === false) {
    getChar('请输入执行环境').then(data => {
      debug(data);
    });
 }
}

/**
 *
 *
 */

function start () {
	const cssFile = path.join(settings.paths.PUBLIC, 'assets', 'css', 'styles.css');
	if (!fs.existsSync(cssFile)) renderCSS(); // css文档不存在时进行生成

  startHttpd();

  if (process.env.NODE_ENV === 'development') {
    scssMonitor();
    srcMonitor();
  }
}

/**
 * 启动HTTPD服务
 */

async function startHttpd () {
  const args = [
    path.join(settings.paths.SERVER, 'https', 'httpd.mjs'),
  ]; 

  const options = {
    detached: false, // 主进程退出后是否保持执行
		env: process.env,
    // stdio: process.env.NODE_ENV === 'development' ? [0, 1, 2, null] : 'ignore',
    stdio: [0, 1, 2, null],
  };

  proc.httpd = spawn(process.argv[0], args, options);
}

/**
 *
 *
 */

async function srcMonitor () {
	debug('开发模式下监视文件改动');
  const Watchdog = await import('../server/Watchdog.mjs').then(m => m.default);

  const watchdog = new Watchdog(settings.paths.SERVER);

  let timeout = null;
  let test = null;

  watchdog.on('change', () => {
    if (timeout) clearTimeout(timeout);

    // 延迟执行
    timeout = setTimeout(() => {
      if (proc.httpd) process.kill(proc.httpd.pid, 'SIGTERM');
      startHttpd();
    }, 1000);
  });
}


async function scssMonitor () {
	debug('scss监视器开始工作');
  const Watchdog = await import('../server/Watchdog.mjs').then(m => m.default);
  const watchdog = new Watchdog(path.join(settings.paths.SRC, 'scss'));
  let timeout = null;

  watchdog.on('change', (file) => {
    if (timeout) {
      debug('file:%s发生改动, 取消上次改动计划的重新渲染', file);
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      renderCSS();
    }, 1200); // 1200ms延迟
  });
}

function renderCSS () {
  exec(path.join(__dirname, 'css-render') + ' ' + path.join(path.dirname(__dirname), 'src', 'scss', 'styles.scss'),
    async (error, stdout, stderr) => {
    if (error) console.error(error);
    if (stdout) {
      const css = stdout;
      const cssFile = path.join(path.dirname(__dirname), 'public', 'assets', 'css', 'styles.css');
      await fs.promises.mkdir(path.dirname(cssFile), { recursive: true }).catch(console.error); 

      Promise.all([
        fs.promises.writeFile(cssFile, css),
        fs.promises.writeFile(cssFile + '.gz', zlib.gzipSync(css)),
        fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(css)),
        fs.promises.writeFile(cssFile + '.deflate', zlib.deflateSync(css)),
      ]);
      

    };
    if (stderr) console.log(stderr);
  });
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
		servername: 'zzlx.org',
		rejectUnauthorized: false,
    checkServerIdentity: (hostname, cert) => { 
			debug(hostname);
			debug(cert);
      return null;
    },
  };

  return new Promise((resolve, reject) => {
    const conn = tls.connect(options, () => {
      // byte1: token
      const byte1 = new Uint8Array(1);
      byte1.set([0b11111111], 0);

      const data = Buffer.from(JSON.stringify({
        token: settings.passphrase,
        authorized: conn.authorized,
        command: command
      }));

      conn.end(Buffer.concat([byte1, data]));
      resolve();
    });

    conn.on('error', e => {
      if (e.code === 'ECONNREFUSED') {
        debug('Server daemon is not exist, try to start it later!');
        resolve();
        return;
      }

      if (e.code === 'UNALBE_TO_GET_ISSUER_CERT') {
        debug('Unable to get issuer from cert');
        resolve();
        return;
      }

      debug(e);
      reject(e);
    });
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
  const divideLine = new Array(process.stdout.columns).join('-');
  process.stdout.write(
    `${divideLine}
ERP服务器使用帮助
Usage: erps.mjs [options]

Options:
  -h, --help                  显示帮助信息
  -v, --version               显示版本信息
  --start                     启动服务
  --stop                      关闭服务
  --restart                   重启服务
${divideLine}
`);
}

/**
 * 显示版本信息
 */

function showVersion () {
  console.log(settings.version);
}


/**
 * 从标准输入中读入字符
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符 
 */

function getChar () {
  const question = arguments[0];

  process.stdout.write(String(question));

  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}

/*
 */

function copyUmd2Assets () {
  // 定义样式文件路径
  const paths = settings.paths; // 获取目录配置
  const destPath = path.join(paths.PUBLIC, 'assets', 'js');
  fs.mkdirSync(destPath, {recursive: true});

  // 执行拷贝任务
  Promise.all([ 
    // source files
    //path.join('@babel', 'polyfill', 'dist', 'polyfill.min.js'),
    path.join('react', 'umd', 'react.development.js'),
    path.join('react', 'umd', 'react.production.min.js'),
    path.join('react-dom', 'umd', 'react-dom.development.js'),
    path.join('react-dom', 'umd', 'react-dom.production.min.js'),
  ] 
    .map(src => path.join(paths.NODE_MODULES, src))
    .map(src => fs.promises.copyFile(src, path.join(destPath, path.basename(src))))
  );
}

/**
 * 配置
 *
 */

function systemdSetup () {
  return `
[Unit]
Description=ERP daemon

[Service]
Type=simple
ExecStart=${path.join(settings.paths.BIN, 'erpd')}

[Install]
WantedBy=multi-user.target
`; 

}
