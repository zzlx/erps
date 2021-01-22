/**
 * *****************************************************************************
 * 
 * ERP Service Daemon
 *
 * 后台服务驻留程序
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cluster from 'cluster';
import EventEmitter from 'events';
import fs from 'fs';
import http2 from 'http2';
import net from 'net';
import os from 'os';
import path from 'path';

import settings from './settings.mjs';

import { argvParser, console } from './utils.lib.mjs';
import TaskExecutor from './utils/TaskExecutor.mjs';
import debuglog from './utils/debuglog.mjs';

const debug = debuglog('debug:main'); // 调试信息打印工具

/**
 * main application
 *
 * @param {object} argvs
 */

(function main (argvs) {
  const paramMap = argvParser(argvs);

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
      case 'h':
      case 'help':
        delete paramMap[param];
        showHelp();
        break;
      case 'v':
      case 'version':
        delete paramMap[param];
        showVersion();
        break;
      case 'start':
        delete paramMap[param];
        start();
        break;
      case 'stop':
        delete paramMap[param];
        stop();
        break;
      case 'restart':
        delete paramMap[param];
        stop('RESTART');
        break;
    }

    if (Object.keys(paramMap).length > 0) {
      console.log('The param: %s is not supported.', Object.keys(paramMap).join(' '));
    }
  }
})(Array.prototype.slice.call(process.argv, 2)); // 立即执行主程序

/**
 * close
 */

function stop (command = 'STOP') {
  const con = net.connect({ port: settings.system.port + 1 }, () => {
    const message = JSON.stringify({
      token: 'test',
      command: command
    });

    con.write(message);

    con.on('data', chunk => {
      debug(chunk.toString());
      con.end();
    });
  });

  con.on('error', e => {
    if (e.code === 'ECONNREFUSED') {
      console.log('服务未启动，请先启动服务');
    }
  });
}

/**
 * 启动服务
 */

function start () {

  // 配置进程
  processSetup();

  // 后台驻留程序,用于管理进程
  const daemon = net.createServer(socket => {
    if (socket.remoteAddress !== socket.localAddress) {
      return socket.end(); // 不接受非本机地址访问
    }

    socket.on('data', chunk => {
      const data = JSON.parse(chunk.toString());
      if (data.token === 'test') {
      }

      switch (data.command) {
        case 'STOP':
          socket.write('后端服务已在安排退出.');
          daemon.close();
          break;
        case 'RESTART':
          socket.write('后端服务重启命令正在安排.');
          daemon.close(() => {
            start(); // 重启服务
          });
          break;
      }
    });

  });

  daemon.on('error', e => { 
    if (e.code === 'EADDRINUSE') { 
       console.log("The service is running, try '--restart'."); 
    }

  });

  daemon.listen({
    ipv6Only: false,
    exclusive: true,
    host: settings.system.host,
    port: settings.system.port + 1, // 驻留程序使用默认服务端口+1
  }, () => {

    console.log(console.divideLine());
    console.log('服务器监控信息: ')
    console.log(console.divideLine('-'));
    console.log({
      '运行模式': process.env.NODE_ENV,
      '内存总量': Number(os.totalmem())/1024/1024/1024 + 'G',
      '空闲内存': Number(os.freemem()/1024/1024).toFixed(2) + 'M',
      '监听地址': daemon.address(),
      '连接计数': daemon.connections,
    });
    console.log(console.divideLine());

  });
}

function processSetup () {
  process.title = settings.packageJSON.name;
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  process.on('exit', code => {
    const uptime = Math.ceil(process.uptime()*1000);
    debug(
      `${process.title}(PID:${process.pid}) is running ${uptime}ms before exit.`);
  });

  // 被捕获的exception\rejection,需要进行妥善处理
  // 不应出现未经管理的exception
  process.on('uncaughtException', (error, origin) => {
    console.log(error);
  });

  // 系统不应出现未经管理的rejection
  process.on('unhandledRejection', (reason, promise) => {
    console.log(reason);
  });
}

/**
 *
 * create http server
 *
 */

function createHttpServer (options = {}) {
  const opts = Object.assign({
    allowHTTP1: true,
    //ca: [fs.readFileSync('client-cert.pem')],
    key: null,
    cert: null,
    passphrase: null,
    requestCert: false, // 客户端证书支持
    
    //sigalgs: 
    //ciphers: 
    //clientCertEngine: 
    //dhparam
    //ecdhCurve
    //origins: [],
    //privateKeyEngine
    //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
    handshakeTimeout: 120 * 1000, // milliseconds
    //ticketKeys: crypto.randomBytes(48), 
    sessionTimeout: 300, // seconds
  }, options);

  return opts.cert && opts.key
    ? http2.createSecureServer(opts)
    : http2.createServer(opts);
}

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

/*
  registerEventHandlers () {
    // This event is emitted when a new TCP stream is established, 
    // before the TLS handshake begins.
    // socket is typically an object of type net.Socket
    this.server.on('connection', socket => {
      debug(
        `connection is come from ${socket.remoteAddress}:${socket.remotePort}`);
    });

    this.server.on('error', (err) => {
      debug(err);

      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${err.port} is used, try again later.`);
      }
    });

    // The keylog event is emitted when key material is generated 
    // or received by a connection to this server
    // (typically before handshake has completed, but not necessarily).
    // This keying material can be stored for debugging, 
    // as it allows captured TLS traffic to be decrypted. 
    // It may be emitted multiple times for each socket.
    this.server.on('keylog', (line, tlsSocket) => {
      logWriter(path.join(paths.PATH_LOG, 'ssl-keys.log'), line.toString());
    });

    // event is emitted when the client sends a certificate status request. 
    this.server.on('OCSPRequest', (certificate, issuer, cb) => {
      debug('OCSPRequest event');
      debug(crypto.Certificate.exportPublicKey(certificate));
      cb(null, null);
    });

    // The 'resumeSession' event is emitted 

    // The 'newSession' event is emitted upon creation of a new TLS session. 
    // This may be used to store sessions in external storage. 
    // The data should be provided to the 'resumeSession' callback.
    this.server.on('newSession', (sessionId, sessionData, cb) => {
      sessionStore.set(sessionId.toString('hex'), sessionData);
      cb();
    });

    // when the client requests to resume a previous TLS session. 
    this.server.on('resumeSession', (id, cb) => {
      const sessionData = sessionStore.get(id.toString('hex')); 

      if (sessionData) { 
        cb(null, sessionData);
      } else {
        debug('resumeSession faile');
        cb(null, null);
      }
    });

    // he 'secureConnection' event is emitted after the handshaking process 
    // for a new connection has successfully completed. 
    this.server.on('secureConnection', tlsSocket => {
      debug('secureConnection');
    });

    // event is emitted when an error occurs before a secure connection is established.
    this.server.on('tlsClientError', (exception, tlsSocket) => {
      debug('tlsClientError: ', exception);
    });

    this.server.on('unknownProtocol', (error) => {
      debug('unknownProtocol');
    });
  }
}

*/


/**
 * 执行任务
 */

function tasks () {
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

function showHelp () {
  console.log('Help');
}

/**
 * 显示版本信息
 */

function showVersion () {
  console.log(settings.packageJSON.version);
}

  const options = {
    cert: settings.config.cert,
    key: settings.config.privateKey,
    passphrase: settings.config.passphrase, // 证书passphrase
  };

