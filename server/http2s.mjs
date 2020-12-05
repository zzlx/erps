/**
 * *****************************************************************************
 *
 * Http2 server
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import http2 from 'http2';
import path from 'path';
import WebSocket from '../src/koa/WebSocket.mjs'
import { inspect, } from '../src/utils.lib.mjs';
import logWriter from '../src/koa/logWriter.mjs';
import settings from '../config/index.mjs';
import util from 'util';

// 调试信息打印工具
const debug = util.debuglog('http2s.mjs');
const paths = settings.paths;
const sessionStore = new Map();  // 存储器

export default (options = {}) => {
  const opts = Object.assign({
    allowHTTP1: true,
    //ca: [fs.readFileSync('client-cert.pem')],
    key: null,
    cert: null,
    passphrase: null, // 证书passphrase
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
  }, options)

  const server = http2.createSecureServer(opts);

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
    debug('keylog:', line.toString());
    logWriter(path.join(paths.LOG_PATH, 'ssl-keys.log'), line.toString());
  });

  /*
  // The 'newSession' event is emitted upon creation of a new TLS session. 
  // This may be used to store sessions in external storage. 
  // The data should be provided to the 'resumeSession' callback.
  server.on('newSession', (sessionId, sessionData, cb) => {
    debug('newSession event is emitted.');
    sessionStore.set(sessionId.toString('hex'), sessionData);
    cb();
  });
  */

  // event is emitted when the client sends a certificate status request. 
  server.on('OCSPRequest', (certificate, issuer, cb) => {
    debug('OCSPRequest event');
    debug(crypto.Certificate.exportPublicKey(certificate));
    cb(null, null);
  });

  /*
  // The 'resumeSession' event is emitted 
  // when the client requests to resume a previous TLS session. 
  server.on('resumeSession', (id, cb) => {
    const sessionData = sessionStore.get(id.toString('hex')); 

    if (sessionData) {
      debug('resumeSession success');
      cb(null, sessionData);
    } else {
      debug('resumeSession faile');
      cb(null, null);
    }
  });
  */

  // he 'secureConnection' event is emitted after the handshaking process 
  // for a new connection has successfully completed. 
  server.on('secureConnection', tlsSocket => {
    debug('secureConnection');
  });

  // event is emitted when an error occurs before a secure connection is established.
  server.on('tlsClientError', (exception, tlsSocket) => {
    debug('tlsClientError: ', exception);
  });

  // endof tls server events

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

  return server;
}  
