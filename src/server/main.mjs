/**
 * *****************************************************************************
 *
 * HTTPD服务
 *
 * @file index.mjs
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import configureApp from './configureApp.mjs';

// 进程管理
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 初始化系统环境 
process.title = process.title + '.' + 'httpd'; // 设置进程名称

const debug = util.debuglog('debug:main');
// 定义pidFile文件路径
const pidFile = `${process.env.HOME}/.${process.title}.pid`;

// 将process.pid写入PID文件
fs.promises.writeFile(pidFile, String(process.pid), 'utf8');

const deletePidFile = () => fs.promises.unlink(pidFile);

process.on('uncaughtException', (err, origin) => {
	debug('捕获到未被管理的Exception');
	debug(err);
});

// 处理未被控制的rejection
process.on('unhandledRejection', (reason, promise) => {
	debug('捕获到未被管理的Rejection');
	debug('Rejection reason: ', reason);
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
			sigintCount++;
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
  console.log('Process beforeExit event with code: ', code);
});

process.on('exit', (code) => { 
	debug('任务1: 进程正常退出前,删除掉pid文件');
	deletePidFile();
});

const app = configureApp();

// 开启服务器监听
app.listen({
	ipv6Only: false, // 是否仅开启IPV6
	host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
	port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
	exclusive: false, // 是否共享进程端口
});
