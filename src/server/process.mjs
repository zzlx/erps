/**
 * *****************************************************************************
 *
 * 进程管理模块
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

// 进程管理
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 初始化系统环境 
process.title = 'org.zzlx' + '.' + 'httpd'; // 设置进程名称

const debug = util.debuglog('debug:process');

// 定义pidFile文件路径
const pidFile = `${process.env.HOME}/.erps/.${process.title}.pid`;
// 将process.pid写入PID文件
fs.promises.writeFile(pidFile, String(process.pid), 'utf8');
// 定义删除pidFile函数
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
  console.log('beforeExit event code: ', code);
});

process.on('exit', (code) => { 
	debug('任务1: 进程正常退出前,删除掉pid文件');
	deletePidFile();
});

