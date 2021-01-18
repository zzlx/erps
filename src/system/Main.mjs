/**
 * *****************************************************************************
 * 
 * ERP system
 *
 * 主控制程序
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cluster from 'cluster';
import crypto from 'crypto';
import EventEmitter from 'events';
import os from 'os';
import path from 'path';
import fs from 'fs';

import Httpd from './server/Httpd.mjs';
import app from './services/app.mjs';

import { argvParser, console } from './utils.lib.mjs';
import TaskExecutor from './utils/TaskExecutor.mjs';
import debuglog from './utils/debuglog.mjs';
import envParser from './utils/envParser.mjs';

import settings from './settings.mjs';

const debug = debuglog('debug:main');

export default class Main extends EventEmitter {
  constructor(options = {}) {
    super();

    this.argvs = options.argvs;
    this.version = '1.0.0';

    this.state = { errors: [] }

    this.readEnvFile(settings.paths.DOT_ENV); // 读取dotEnv
    this.processSetup();
  }

  /**
   * 执行任务
   */

  tasks () {
    const scssPath = path.join(settings.paths.SRC, 'scss');
    new TaskExecutor({
      watchPath: [ scssPath ],
      callback: () => {

        scssRender(path.join(scssPath, 'styles.scss')).then(res => {
          debug(res.css);
        });
      },
    });
  }

  /**
   * 显示帮助信息
   */
  showHelp () {
    console.log('Help');
  }

  /**
   * 显示版本信息
   */
  showVersion () {
    console.log(this.version);
  }

}



Main.prototype.run = function () {
  const paramMap = argvParser(this.argvs);

  // 处理环境变量配置 
  for (let param of Object.keys(paramMap)) { 
    switch(param) { 
      case 'env': 
        process.env.NODE_ENV = paramMap['env'];
        delete paramMap['env'];
        continue;
      //default:
    }
  }

  for (let param of Object.keys(paramMap)) {
    switch(param) {
      case 'help':
        //showHelp();
        this.showHelp();
        delete paramMap['help'];
        break;
      case 'version':
        this.showVersion();
        delete paramMap['version'];
        break;
      case 'start':
        this.startServer();
        delete paramMap['start'];
        break;
      case 'stop':
        //stop();
        delete paramMap['stop'];
        break;
      case 'restart':
        //restart();
        delete paramMap['restart'];
        break;
    }

    if (Object.keys(paramMap).length > 0) {
      console.log('The param: %s is not supported.', Object.keys(paramMap).join(' '));
    }
  }

}


/**
 *
 */

Main.prototype.watchPath = function (dir) {

}

/**
 * 启动服务
 */

Main.prototype.startServer = function () {

  this.httpd = new Httpd({
    key: settings.privateKey,
    cert: settings.cert,
    passphrase: settings.passphrase, // 证书passphrase
    ticketKeys: crypto.randomBytes(48), 
  });

  this.httpd.server.on('stream', app.callback());

  this.httpd.server.listen({
    ipv6Only: false,
    host: settings.system.ipv6 ? '::' : '0.0.0.0',
    port: process.env.PORT || '8888',
    exclusive: false,
  }, () => {
    console.divideLine();
    console.log('服务器监控信息: ')
    console.divideLine('-');
    console.log({
      'PID': process.pid,
      '运行模式': process.env.NODE_ENV,
      '系统平台': process.platform + '_' + process.arch,
      '处理器信息': os.cpus()[0].model + ' * ' + os.cpus().length,
      '内存总量': Number(settings.system.totalmem)/1024/1024/1024 + 'G',
      '空闲内存': Number(settings.system.freemem/1024/1024).toFixed(2) + 'M',
      '监听地址': this.httpd.server.address(),
      '连接计数': this.httpd.connections,
      '错误计数': this.state.errors,
    });
    console.divideLine();
  });

  this.tasks();
}

Main.prototype.readEnvFile = function (envFile) {
  if (fs.existsSync(envFile)) {
    const dotenvObj = envParser(fs.readFileSync(envFile));
    assert(typeof dotenvObj === 'object', '解析.env文件出错');

    for (let env of Object.keys(dotenvObj)) {
      if (process.env[env] == null) process.env[env] = dotenvObj[env];
    }
  }
}

Main.prototype.processSetup = function () {

  process.title = 'ERPSD';
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  process.on('exit', code => {
    const uptime = Math.ceil(process.uptime()*1000);
    console.info(
      `${process.title}(PID:${process.pid}) is running ${uptime}ms before exit.`);
    if (this.state.errors.length > 0) {
      console.log(this.state.errors);
    }
  });

  // 被捕获的exception\rejection,需要进行妥善处理
  // 不应出现未经管理的exception
  process.on('uncaughtException', (error, origin) => {
    this.emit('error', error);
  });

  // 系统不应出现未经管理的rejection
  process.on('unhandledRejection', (reason, promise) => {
    this.emit('error', reason);
  });

  this.on('error', error => {
    console.log(error);
  });
}

/**
 * *****************************************************************************
 *
 * Utilities
 *
 * 工具如果
 *
 * *****************************************************************************
 */

/**
 * Scss编译生成CSS
 *
 * [参考文档](../../node_modules/node-sass/README.md)
 * [node-sass](https://github.com/sass/node-sass)
 *
 * @param {} scssFile
 * @param {function} cb 
 */

function renderCssFile (scssFile, cssFile) {
  return import('sass').then(m => new Promise((resolve, reject) => {
    const sass = m.default;
    sass.render({
      file: scssFile,
      outputStyle: 'compressed', // 使用压缩模式
    }, (err, result) => { 
      if (err) reject(err);
      resolve(result);
    });
  })).then(res => fs.promise.writeFile(cssFile, res.css));
}
