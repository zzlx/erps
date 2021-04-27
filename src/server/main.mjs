/**
 * *****************************************************************************
 * 
 * 主控制程序
 *
 * 解析启动参数，执行命令任务
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
import { readDir } from './watchd.mjs';

const debug = debuglog('debug:main');
const __dirname = path.dirname(import.meta.url.substr(7));

const onWindows =() => process.platform === 'win32';
const onMacOS =() => process.platform === 'darwin';
const onLinux =() => process.platform === 'linux';

const proc = { }; // Process container

// This is the Fast shutdown mode.
// The server will send all existing server processes SIGTERM
process.on('SIGINT', signal => {
  if (proc.httpd) {
    if (proc.httpd.kill('SIGTERM')) {
      process.exit(0);
    }
  } else {
    process.exit(0);
  }
});

export function main (argvs = Array.prototype.slice.call(process.argv, 2)) {
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
  assert(onLinux(), 'Linux platform is recomanded.');
  renderCSS();  // 渲染生成CSS文件
  startHttpd();
}

/**
 * 启动HTTPD服务
 */

async function startHttpd () {
  const args = [
    path.join(__dirname, 'https', 'httpd.mjs'),
  ]; 

  const options = {
    detached: false, // 主进程退出后是否保持执行
    stdio: [0, 1, 2, null],
  };

  proc.httpd = spawn(process.argv[0], args, options);
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
 * 检测是否配置systemd service
 */

function detectSystemdService (service) {
  const test = [
    '/usr/lib/systemd/system',
    '/etc/systemd/system/multi-user.target.wants',
  ].map(loc => fs.existsSync(path.join(loc, service)));

  debug(test);
}

/**
 *
 *
 */

function renderCSS () {
	const cssFile = path.join(settings.paths.PUBLIC, 'assets', 'css', 'styles.css');
  const scssFile = path.join(settings.paths.SRC, 'scss', 'styles.scss');

  // 比对cssFile与scssFile所在目录所有文件时间戳
  // 决定是否需要执行CSS文件渲染程序
  
  const cssStat = fs.statSync(cssFile);
  const files = readDir(path.dirname(scssFile));
  let reRender = false;


  for (const file of files) {
    const stat = fs.statSync(file);
    if (stat.mtime > cssStat.mtime) {
      reRender = true;
      break;
    }
  }

  reRender && scssRender(scssFile).then(css => {
    debug('重新生成CSS文件');
    fs.mkdirSync(path.dirname(cssFile), { recursive: true });
    Promise.all([
      fs.promises.writeFile(cssFile, css),
      fs.promises.writeFile(cssFile + '.gz', zlib.gzipSync(css)),
      fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(css)),
      fs.promises.writeFile(cssFile + '.deflate', zlib.deflateSync(css)),
    ]);
  });
}

/**
 * Scss编译生成CSS
 *
 * 用于从src/scss目录生成css文件
 *
 * [参考文档](../node_modules/sass/README.md)
 * [node-sass](https://github.com/sass/node-sass)
 */

async function scssRender (scssFile) {
  const sass = await import('sass').then(m => m.default);
  const format = process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed';

  return new Promise((resolve, reject) => {
    sass.render({ file: scssFile, outputStyle: format, }, (err, result) => { 
      if (err) reject(err);
      resolve(result.css);
    });
  });
}
