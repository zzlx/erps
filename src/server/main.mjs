/**
 * *****************************************************************************
 *
 * 服务端主程序
 *
 * 管理服务进程，处理异常
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import createServer from './http2-server.mjs';

const debug = util.debuglog('debug:process');

// 进程管理
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 初始化系统环境 
process.title = 'org.zzlx' + '.' + 'httpd'; // 设置进程名称


// 定义pidFile文件路径
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
});

// SIGINT计数器
let sigintCount = 0;

const signalHandler = (code) => {
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

process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);

// 被重定向时触发进程信号
process.on('SIGPIPE', (code) => {
	debug('Received SIGPIPE');
})

process.on('beforeExit', (code) => {
  console.log('beforeExit event code: ', code);
});

process.on('exit', (code) => { 
	debug('任务1: 进程正常退出前,删除掉pid文件');
	deletePidFile();
});

startApp();

function startApp () {
  // get hostname
  const hostname = cp.execSync("hostname | awk '{printf $1}'");

  // 服务器server配置
  const server = createServer({
    // @todo: read configuration from cofig file
    cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
    key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
  }); 

  return import('./app.mjs').then(m => m.default).then((app) => {
    app.server = server;

    app.listen({
      ipv6Only: false, // 是否仅开启IPV6
      host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
      port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
      exclusive: false, // false 可接受进程共享端口
    });
  });
}
