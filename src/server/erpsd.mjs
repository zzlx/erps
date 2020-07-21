/**
 * *****************************************************************************
 *
 * ERPSD(ERP Services Daemon)
 *
 * A backend services application
 *
 * 管理ERP服务后台驻留程序
 *
 * 启动服务
 * 停止服务
 * 重启服务
 *
 * 进程管理
 * 异常处理
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const ROOT_PATH = path.dirname(path.dirname(__dirname));
const BIN_PATH = path.join(ROOT_PATH, 'bin');
const FILE_NAME = path.basename(__filename, path.extname(__filename));

process.title = `org.zzlx.${FILE_NAME}`;

const debug = util.debuglog(`debug:${FILE_NAME}`);

let server = null;
let http2s = null;

// Set NODE_ENV, default value is production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const pidFile = path.join(os.homedir(), '.erps', `${process.title}.pid`);

if (fs.existsSync(pidFile)) {
  const exist_pid = fs.readFileSync(pidFile);
  console.log(`{process.title}(pid ${exist_pid}) is already exits. Please confirm.`);
  process.exit();
}

fs.promises.writeFile(pidFile, String(process.pid), 'utf8').then(() => {
  debug(`pid ${process.pid} has already write to ${pidFile}`);
}).catch(err => {
  debug('write pid file error: ', err);
});

// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (err, origin) => {
	debug('exception: ', err);
	debug('origin: ', origin);
});

// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
	debug('rejection reason: ', reason);
	debug('promise: ', promise);

  restart();
});


/**
 * process events
 */

process.on('SIGHUP', () => {
  process.exit();
});

let sigintCount = 0; // SIGINT计数器

process.on('SIGINT', function (code) {
  console.log(code);

  if (sigintCount >= 0) {
    process.exit(1); // 结束进程
  } else {
    sigintCounudon++;
    console.log('Press Control-C twice to exit.');
  }
});

// 被重定向时触发进程信号
process.on('SIGPIPE', (code) => {
	debug('Received SIGPIPE');
})

// Set beforeExit event handler
process.on('beforeExit', (code) => {
  debug('beforeExit event: ', code);
});

// Set exit event handler
process.on('exit', (code) => { 
  // 定义删除pidFile函数
  fs.promises.unlink(pidFile).then(() => {
    debug(`delete ${pidFile} success.`);
  }).catch((err) => {
    debug(`delete ${pidFile} failure. reason:`, err);
  }); 
});

run();

/**
 * Functions
 *
 */

function restart () {
}

function start () {
  // get hostname
  //const hostname = cp.execSync("hostname | awk '{printf $1}'");
  const hostname = os.hostname();

  const appPath = path.join(ROOT_PATH, 'src', 'server', 'main.mjs');

  return import(appPath).then(m => m.default).then((app) => {
    app.listen({
      ipv6Only: false, // 是否仅开启IPV6
      host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
      port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
      exclusive: false, // false 可接受进程共享端口
    });

    http2s = app.server;
  }).catch(e => {
    console.log(e);
  });
}

/**
 * stop server
 *
 */

function stop () {
}

/**
 *
 *
 */
function showHelp () {
  process.stdout.write(`

Usage:

  `);
}

/**
 *
 */

function argvParser (argvs) {

  // 如果提供的参数列表为字符,则先转为数组后再解析
  if ('string' === typeof argvs) argvs = argvs.split(/\s+/);

  const params = {};

	const it = argvs[Symbol.iterator]();

	let argv = null;
	let i = -1;

	while ((argv = it.next().value) != null) {
		i++; 

    // @todo: 是否有必要改正则匹配逻辑为字串匹配? 对性能影响极小,暂时不作修改.
    const matcher = argv => /^(?:--(\w+)(?:=(.+))?)|(?:-(\w+))/g.exec(argv);

		const match = matcher(argv);
		if (null == match) continue; // bypass if no match

    const key = match[1];
    const value = match[2];
		const commands = match[3];
		
    if (key) {
      params[key] = value ? value : true;
      if (true === params[key] && argvs[i+1] && null == matcher(argvs[i+1])) {
        params[key] = argvs[i+1];
      }
    }

		if (commands) {
      // 单参数情况时, eg. -o /home/test.txt
			if (commands.length === 1 && argvs[i+1] && null == matcher(argvs[i+1])) {
				params[commands] = argvs[i+1];
			} else {
        for (let v of commands ) params[v] = true; // 多参数情况时，eg. -abc
      }
		}
  }

  return params;
}

/**
 *
 * 解析并执行命令
 *
 */
function run () {

  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const PARAMS = argvParser(ARGVS);

  // 环境配置任务
  for (let param of Object.keys(PARAMS)) {
    switch(param) {
      case 'env':
        process.env.NODE_ENV = PARAMS['env'];
        continue;
      case 'debug':
        process.env.NODE_DEBUG = 'debug:*';
        continue;
      //default:
    }
  }

  // 命令执行
  for (let param of Object.keys(PARAMS)) {
    switch(param) {
      case 'help':
        showHelp();
        break;

      case 'start':
        start();
        break;
      case 'restart':
        start();
        break;
    }
  }
}

