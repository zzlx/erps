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
import os from 'os';
import path from 'path';

import { console } from '../utils.lib.mjs';
import WebSocket from './WebSocket.mjs'
import debuglog from '../utils/debuglog.mjs';
import logWriter from '../utils/logWriter.mjs';
import settings from '../settings.mjs';

// 调试信息打印工具
const debug = debuglog('debug:Httpd.mjs');
const paths = settings.paths;
const sessionStore = new Map();  // 存储器
const server = Symbol('http2-server');

export default class Httpd extends EventEmitter {
  constructor(options = {}) {
    super();
    this.opts = Object.assign({}, {
      websocket: true, // 默认提供websocket protocol服务
    }, options);

    // websocket protocol
    this.ws = this.opts.websocket 
      ? new WebSocket({server: this.server}) 
      : null;

    this.registerEventHandlers();
  }

  close () {
    this.server.close();
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

    this.server.on('close', () => {
      debug('server is closed');
    });

    // The keylog event is emitted when key material is generated 
    // or received by a connection to this server
    // (typically before handshake has completed, but not necessarily).
    // This keying material can be stored for debugging, 
    // as it allows captured TLS traffic to be decrypted. 
    // It may be emitted multiple times for each socket.
    this.server.on('keylog', (line, tlsSocket) => {
      logWriter(path.join(paths.LOG_PATH, 'ssl-keys.log'), line.toString());
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

