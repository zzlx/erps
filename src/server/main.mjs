/**
 * *****************************************************************************
 *
 * Backend services application
 *
 * 管理HTTP服务进程
 * 管理异常及错误处理
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
const debug = util.debuglog('debug:main');

process.title = 'org.zzlx' + '.' + 'httpd'; // set process title

const pidFile = `${process.env.HOME}/.erps/.${process.title}.pid`;

// 将process.pid写入PID文件
fs.promises.writeFile(pidFile, String(process.pid), 'utf8');

// 定义删除pidFile函数
const deletePidFile = () => fs.promises.unlink(pidFile);

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

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);

// 被重定向时触发进程信号
process.on('SIGPIPE', (code) => {
	debug('Received SIGPIPE');
})

// Set beforeExit event handler
process.on('beforeExit', (code) => {
  console.log('beforeExit event code: ', code);
	deletePidFile();
});

// Set exit event handler
process.on('exit', (code) => { 
  debug('Service is running ', process.uptime(), 's ', 'before exit.');
});

start();

let restart_attempt = 10000; // 尝试重启10000次,后台通知开发人员进行关注并处理

function restart () {
  if (restart_attempt === 0) {
    retstart_attempt = 10000;
    return;
  }

  restart_attempt--;
}

async function start () {
  // get hostname
  //const hostname = cp.execSync("hostname | awk '{printf $1}'");
  const hostname = os.hostname();

  const createServer = await import('./http2-server.mjs').then(m => m.default);

  // 服务器server配置
  const server = createServer({
    // @todo: read configuration from cofig file
    cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
    key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
  }); 

  return import('./services.mjs').then(m => m.default).then((app) => {
    app.server = server;

    app.listen({
      ipv6Only: false, // 是否仅开启IPV6
      host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
      port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
      exclusive: false, // false 可接受进程共享端口
    });
  });
}

// SIGINT计数器
let sigintCount = 0;

function signalHandler (code) {
	debug('Process signal: ', code);

	if (code === 'SIGINT') {
		if (sigintCount >= 0) {
			process.exit(1); // 结束进程
		} else {
			sigintCounudon++;
			console.log('Press Control-C twice to exit.');
		}
	}
}
