/**
 * *****************************************************************************
 *
 * http Server
 * ======
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

import logWriter from '../logWriter.mjs';
import debuglog from '../debuglog.mjs';
import settings from '../settings/index.mjs';
import WebSocketServer from '../websocket/Server.mjs';

const debug = debuglog('debug:httpd'); // 调试信息打印工具
const sessionStore = new Map();
const socketClients = new Map();

const opts = {
};

const server = opts.cert && opts.key 
  ? http2.createSecureServer(opts)
  : http2.createServer(opts);

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

wss.on('message', (data, socket) => {
  debug('websocket message:', data, ' from :', socket.remoteAddress);
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

server.on('stream', streamHandler);

/**
 * *****************************************************************************
 *
 * Utility functions
 *
 * *****************************************************************************
 */

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
