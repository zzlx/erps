/**
 * *****************************************************************************
 *
 * Http service Daemon
 * ===================
 *
 * 守护进程
 *
 * ## 参考文档
 *
 * * [Node HTTP/2](https://nodejs.org/dist/latest-v15.x/docs/api/http2.html)
 *
 * *****************************************************************************
 */

import cluster from 'cluster';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import http2 from 'http2';
import { spawn } from 'child_process';

import logWriter from './logWriter.mjs';
import debuglog from './debuglog.mjs';
import settings from './settings/index.mjs';
import app from './services/index.mjs';
import WebSocketServer from './websocket/Application.mjs';

const debug = debuglog('debug:httpd'); // 调试信息打印工具
const sessionStore = new Map();
const socketClients = new Map();

// Set process title
process.title = 'org.zzlx.httpd';

process.on('uncaughtException', (error, origin) => {
  console.log(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
});

const opts = {
  allowHTTP1: true,
  //ca: [fs.readFileSync('client-cert.pem')],
  key: settings.privateKey,
  cert: settings.cert,
  passphrase: settings.passphrase,
  requestCert: false, // 客户端证书支持
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  //origins: [],
  //privateKeyEngine
  //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
  //ticketKeys: crypto.randomBytes(48), 
  handshakeTimeout: 120 * 1000, // milliseconds
  sessionTimeout: 300, // seconds
};

const server = opts.cert && opts.key 
  ? http2.createSecureServer(opts)
  : http2.createServer(opts);

process.nextTick(() => start()); //  启动服务

// 注册close处理程序
server.on('close', () => {
  debug('The server is closed gracefull.');
});


// 注册error处理程序
server.on('error', e => {
  if (e.code === 'EADDRINUSE') { 
    if (process.send) {
      process.send(e);
    } else {
      console.log(`${process.title} is runing on ${e.address}:${e.prot}, try again later`);
    }
  }

});

server.on('keylog', (line, tlsSocket) => {
  logWriter(path.join(settings.paths.PATH_LOG, 'ssl-keys.log'), line.toString());
});

/**
 * upgrade handler
 */

// websocket server
const wss = new WebSocketServer({});

wss.on('message', data => {
  // 放置处事件理器
  //debug('websocket message:', data);
});

server.on('upgrade', (req, socket, head) => {
  wss.upgradeHandler(req, socket, head);
});

server.on('connection', (socket) => {
  debug('connection envent');
  //debug(socket);
});


// he 'secureConnection' event is emitted after the handshaking process 
// for a new connection has successfully completed. 
server.on('secureConnection', socket => {
  debug('secureConnection event');

  socket.on('data', buffer => {
    try {
      const message = JSON.parse(buffer.toString());
      debug('Receive: ', message);
      if (message.token !== settings.passphrase) return; // 过滤socket
      exec(message.command);
    } catch (e) {
      //不做处理
    }
  });

});

// This event is emitted when a new TCP stream is established, 
// before the TLS handshake begins.
// socket is typically an object of type net.Socket

// The keylog event is emitted when key material is generated 
// or received by a connection to this server
// (typically before handshake has completed, but not necessarily).
// This keying material can be stored for debugging, 
// as it allows captured TLS traffic to be decrypted. 
// It may be emitted multiple times for each socket.
// event is emitted when the client sends a certificate status request. 
server.on('OCSPRequest', (certificate, issuer, cb) => {
  debug('OCSPRequest event handler: @todo: 支持客户端证书验证');
  //debug(crypto.Certificate.exportPublicKey(certificate));
  cb(null, null);
});

// The 'resumeSession' event is emitted 

// The 'newSession' event is emitted upon creation of a new TLS session. 
// This may be used to store sessions in external storage. 
// The data should be provided to the 'resumeSession' callback.
server.on('newSession', (sessionId, sessionData, cb) => {
  sessionStore.set(sessionId.toString('hex'), sessionData);
  cb();
});

// when the client requests to resume a previous TLS session. 
server.on('resumeSession', (id, cb) => {
  const sessionData = sessionStore.get(id.toString('hex')); 

  if (sessionData) { 
    cb(null, sessionData);
  } else {
    debug('resumeSession faile');
    cb(null, null);
  }
});

// event is emitted when an error occurs before a secure connection is established.
server.on('tlsClientError', (exception, tlsSocket) => {
  // use http protocol access https protocol
  // ERR_SSL_HTTP_REQUEST
  // @todo: redirect to https protocol
  tlsSocket.end();
});

server.on('unknownProtocol', (error) => {
  debug('unknownProtocol');
});

const streamHandler = app.callback();
app.httpServer = server;

server.on('stream', (stream, headers, flags) => {
  streamHandler(stream, headers, flags);
});

server.on('listening', function () {
  if (process.channel && process.send) {
    process.send({ 
      message: '服务器已启动',
      pid: process.pid,
      address: this.address(),
    });
  } else {
    debug('Http server is listening on:', this.address());
  }
});

/**
 * *****************************************************************************
 *
 * Utility functions
 *
 * *****************************************************************************
 */

function start () {
  server.listen({ 
    ipv6Only: false, 
    exclusive: true,
    host: settings.host,
    port: settings.port,
  });
}

function exec (cmd) {
  switch(cmd) {
    case 'STOP': 
      server.close(() => { });
      break;
    case 'RESTART': 
      server.close(() => {
        start();
      });
      break;
    default:
      debug('Unknown Server Action.');
  }
}
