/**
 * *****************************************************************************
 *
 * Http2 daemon
 *
 * 支持的功能
 *
 * * websocket protocol
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import http2 from 'http2';
import path from 'path';
import util from 'util';

import logWriter from './utils/logWriter.mjs';
import settings from '../settings/index.mjs';
import WebSocket from './WebSocketServer.mjs'
import app from './app.mjs';

// 调试信息打印工具
const debug = util.debuglog('debug:http2s.mjs');
const paths = settings.paths;
const sessionStore = new Map();  // 存储器
const streamHandler = app.callback();
const server = Symbol('http2-server');

export default class HttpServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.opts = Object.assign({}, {
      websocket: true, // 默认提供websocket protocol服务
    }, options);

    app.server = this.server;

    // websocket protocol
    this.ws = this.opts.websocket 
      ? new WebSocket({server: this.server}) 
      : null;
  }

  get connections () {
    return sessionStore.size;
  }

  get server () {
    if (this[server] == null) {
      this[server] = http2.createSecureServer({
        allowHTTP1: true,
        //ca: [fs.readFileSync('client-cert.pem')],
        key: this.opts.key,
        cert: this.opts.cert,
        passphrase: this.opts.passphrase, // 证书passphrase
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
        ticketKeys: null,
        sessionTimeout: 300, // seconds
      });
    }

    return this[server];
  }

  listen () {
    this.server.on('stream', streamHandler);
    this.server.listen.apply(this.server, arguments);
  }
}

/**
 * Utilities
 */

/*
  // handle tls server events:

  // This event is emitted when a new TCP stream is established, 
  // before the TLS handshake begins.
  // socket is typically an object of type net.Socket
  server.on('connection', socket => {
    debug('connection is come from ', socket.remoteAddress);
  });

  // The keylog event is emitted when key material is generated 
  // or received by a connection to this server
  // (typically before handshake has completed, but not necessarily).
  // This keying material can be stored for debugging, 
  // as it allows captured TLS traffic to be decrypted. 
  // It may be emitted multiple times for each socket.
  server.on('keylog', (line, tlsSocket) => {
    logWriter(path.join(paths.LOG_PATH, 'ssl-keys.log'), line.toString());
  });

  // event is emitted when the client sends a certificate status request. 
  server.on('OCSPRequest', (certificate, issuer, cb) => {
    debug('OCSPRequest event');
    debug(crypto.Certificate.exportPublicKey(certificate));
    cb(null, null);
  });

  // The 'resumeSession' event is emitted 

  // The 'newSession' event is emitted upon creation of a new TLS session. 
  // This may be used to store sessions in external storage. 
  // The data should be provided to the 'resumeSession' callback.
  server.on('newSession', (sessionId, sessionData, cb) => {
    sessionStore.set(sessionId.toString('hex'), sessionData);
    debug(sessionStore);
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

  // he 'secureConnection' event is emitted after the handshaking process 
  // for a new connection has successfully completed. 
  server.on('secureConnection', tlsSocket => {
    debug('secureConnection');
  });

  // event is emitted when an error occurs before a secure connection is established.
  server.on('tlsClientError', (exception, tlsSocket) => {
    debug('tlsClientError: ', exception);
  });

  server.on('unknownProtocol', (error) => {
    debug('unknownProtocol');
  });

  server.on('error', (err) => {
    debug(err);

    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${err.port} is used, try again later.`);
    }
  });

  server.on('close', () => {
    console.log('server is closed');
  });
*/

