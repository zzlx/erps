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
import EventEmitter from 'events';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import fs from 'fs';

import settings from './settings.mjs';

import { argvParser, console } from './utils.lib.mjs';
import TaskExecutor from './utils/TaskExecutor.mjs';
import debuglog from './utils/debuglog.mjs';

const debug = debuglog('debug:main');

class Main extends EventEmitter {
  constructor(options = {}) {
    super();
    this.version = options.version || "1.0.0";
    this.name = options.name || 'zzlx';

    this.state = { 
      errors: [] 
    }

    this.processSetup();
  }

  setup () {
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
    console.log(settings.packageJSON.version);
  }

}

Main.prototype.run = function (argvs) {
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
 * 启动服务
 */

Main.prototype.startServer = async function () {
  const options = {
    cert: settings.config.cert,
    key: settings.config.privateKey,
    passphrase: settings.config.passphrase, // 证书passphrase
  };

  this.https = createHttpServer(options);

  this.https.server.listen({
    ipv6Only: false,
    host: process.env.IPV6 === 'true' ? '::' : '0.0.0.0',
    port: process.env.PORT || '8888',
    exclusive: false,
  }, () => {
    console.divideLine();
    console.log('服务器监控信息: ')
    console.divideLine('-');
    console.log({
      'AppVersion': this.version,
      'NodeVersion': process.version,
      '运行模式': process.env.NODE_ENV,
      '内存总量': Number(os.totalmem())/1024/1024/1024 + 'G',
      '空闲内存': Number(os.freemem()/1024/1024).toFixed(2) + 'M',
      '监听地址': this.https.server.address(),
      '连接计数': this.https.connections,
      '错误计数': this.state.errors,
    });
    console.divideLine();
  });

  this.tasks();
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

/**
 * *****************************************************************************
 *
 * 执行主程序
 *
 * *****************************************************************************
 */

const main = new Main({
  name: settings.packageJSON.name,
  version: settings.packageJSON.version,
});

main.run(Array.prototype.slice.call(process.argv, 2));

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
