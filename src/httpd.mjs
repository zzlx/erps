/**
 * *****************************************************************************
 *
 * Http service Daemon
 *
 * @author: wangxuemin@zzlx.org
 * @file: Httpd.mjs
 * *****************************************************************************
 */

import { spawn } from 'child_process';
import cluster from 'cluster';
import http2 from 'http2';

import debuglog from './utils/debuglog.mjs';
import settings from './settings/index.mjs';

const debug = debuglog('debug:https.mjs'); // 调试信息打印工具

const opts = {
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
};

const server = opts.cert && opts.key
    ? http2.createSecureServer(opts)
    : http2.createServer(opts);

server.on('error', e => {
  if (e.code === 'EADDRINUSE') {
    console.warn && console.warn('服务端口正在被使用中...');
  }
});

server.on('connection', socket => {
});

process.on('message', (message) => {
  if (message === 'start') {
  }
});

function start (cb = () => {}) {
  server.listen({
    ipv6Only: false,
    exclusive: true,
    host: settings.system.host,
    port: settings.system.port,
  }, cb);
}

function stop (cb) {
  server.close(() => {
    debug('Http服务已退出.');
    if (cb) cb();
  });
}

function streamHandler (fn) {
  if (server.eventNames('stream').indexOf('stream') > -1) {
    throw new Error('The stream handler is already exitsed.');
  }

  server.on('stream', fn);
}

/**
 * *****************************************************************************
 * Utilities
 * *****************************************************************************
 */

function connectionHandler (socket) {

}

function errorHandler (e) {
  if (e.code === 'EADDRINUSE') { 
     console.log("The address is in use, please try again later."); 
  }
}

function registerEventHandlers () {
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
