/**
 * *****************************************************************************
 *
 * Main programe
 *
 * [Server Documents](../src/doc/Server.md)
 *
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';
import tls from 'tls';
import util from 'util';
import { argvParser, debounceAlgorithm } from './utils/index.mjs';
import { configs, paths } from "./settings/index.mjs";
import { scssRender } from './utils/scssRender.mjs';
//import readJSON from './readJSON.cjs';

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const debug = util.debuglog('debug:main');
const argvs = Array.prototype.slice.call(process.argv, 2); 
const paramMap = argvParser(argvs);

process.nextTick(() => { main(); });


// Process container
const proc = {
  httpd: null,
}; 

// 检测参数
const detectParamMap = () => {
};

/**
 * The main programe
 */

function main () {
  let isExec = false; // 是否执行
  
  for (let param of Object.keys(paramMap)) {
    switch(param) {
      case "devel":
      case "development":
        delete paramMap[param];
        break;
      case "h":
      case "help":
        isExec = true;
        delete paramMap[param];
        import('./help.mjs').then(m => m.help());
        break;
      case "v":
      case "version":
        isExec = true;
        delete paramMap[param];
        import('./version.mjs').then(m => m.version());
        break;
      case "start":
        isExec = true;
        delete paramMap[param];
        startHttpd();
        scssRender(); // 监测无css文件时再生成文件
        if (paramMap.watch) { watchPath(); }
        break;
      case "renderCSS":
        isExec = true;
        delete paramMap[param];
        scssRender(); // 渲染生成CSS文件
        break;
      case "copyJS":
        isExec = true;
        delete paramMap[param];
        import('./utils/copyJS.mjs').then(m => m.copyJS).then(fn => fn([
          path.join(paths.NODE_MODULES, "react", "umd", "react.development.js"),
          path.join(paths.NODE_MODULES, "react", "umd", "react.production.min.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.development.js"),
          path.join(paths.NODE_MODULES, "react-dom", "umd", "react-dom.production.min.js")
        ]));

        break;
      case "stop":
        isExec = true;
        delete paramMap[param];

        break;
      case "restart":
        isExec = true;
        delete paramMap[param];
        restartHttpd();
        break;
    } // end of switch
  } // end of for loop

 /*
 if (isExec === false) {
    getChar("请输入执行环境").then(data => {
      debug(data);
    });
 }
 */

}

/**
 * 监控目录变动
 *
 * @todos: 
 * 将监控目录的代码单独存放
 * 独立进程监控代码库改动，重启服务时使用热加载并保持原进程ID
 */

async function watchPath () {
  const { PathWatcher } = await import('./utils/PathWatcher.mjs');

  const restartHttps = debounceAlgorithm(() => {
    debug('Restart httpd....');
    //debug("Restart service.");
    //sendCommand("RESTART");
    restartHttpd();

    //startHttpd(); // 由httpd进程自主控制重启
  }, 1000); // 每1000ms内仅重启1次 

  const reRenderCss = debounceAlgorithm(() => {
    scssRender();
  }, 5000);

  const watcher = new PathWatcher([ 
    // the paths need to be watched
    paths.SERVER, 
    paths.SRC, 
    paths.UIS, 
  ]);

  watcher.on("change", (f) => {
    debug(`File change:${f}`);
    if (/\.mjs/.test(f)) {
      // @todo: 不重启服务热更新前端代码
      /*
      if (/src\/uis/.test(f)) {
        return;
      }
      */

      restartHttps();
    } else if (/\.ts$/.test(f)) {
      //tsc();
    } else if (/\.scss/.test(f)) {
      scssRender();
    } 

  });
}

/**
 *
 *
 */

function tsc () {
  debug('执行tsc');
  cp.exec('tsc', (err, stdout, stderr) => {
    if (err) debug('err:', err);
    debug('stdout:', stdout);
    if (stderr) debug('stderr:', stderr);
  });
}


/**
 * start http daemon
 */

function startHttpd () {
  const args = [
    path.join(__dirname, "utils", "http2d.mjs")
  ];

  proc.httpd = cp.spawn(process.argv[0], args, {
    // keep running when the main process is exit
    // 若设置为true，后台服务无法重启 
    detached: false, 
    stdio: [0, 1, 2, null],
  });

}

function stopHttpd () {
  if (proc.httpd && proc.httpd.killed == false) {
    proc.httpd.kill('SIGTSTP');

  } else {
    debug('Send stop command to HTTPD');
    sendCommand('STOP');
  }

}

function restartHttpd () {

  if (proc.httpd && proc.httpd.killed == false) {
    //debug('发送SIGTSTP信号给http服务');
    debug('Send SIGTERM to HTTPD');
    proc.httpd.kill('SIGTERM');
  } else {
    debug('Send RESTART to HTTPD');
    sendCommand('RESTART');
  }

  startHttpd();
}

/**
 * 发送命令给服务进程
 */

function sendCommand (command) {
  const options = {
    host: "localhost",
    port: "8888", // the port should connect to
    ca: configs.cert,
    rejectUnauthorized: false,
    checkServerIdentity: (hostname, cert) => {
      return null;
    },
  };

  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {

      debug('client connected', 
        socket.authorized ? 'authorized' : 'unauthorized'
      );

      process.stdin.pipe(socket);
      process.stdin.resume();
    });

    socket.on('end', () => {
      debug('server ends connection');
    });

    socket.on('secureConnect', () => {
      // byte1: token
      const byte1 = new Uint8Array(1);
      byte1.set([0b11111111], 0);

      const data = Buffer.from(JSON.stringify({
        token: configs.passphrase,
        authorized: socket.authorized,
        command: command
      }));

      debug('send command: %s', command);
      socket.end(Buffer.concat([byte1, data]));

      resolve();
    });

    socket.on("error", e => { 
      if (e.code === "ECONNREFUSED") {
        debug('主控程序发送控制信号被拒绝:', e.code);
      } else if (e.code === "ECONNRESET") {
        debug('服务器端主动断开连接:', e.code);
      } else {
        debug('主控程序客户端错误:', e.code) 
      }
    }); // error event
  //
  });
}

/**
 * 命令行交互式工具
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符
 */

function getChar () {
  const question = arguments[0];

  process.stdout.write(String(question));

  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}
