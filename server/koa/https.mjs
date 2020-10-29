/**
 * *****************************************************************************
 *
 * Http server
 *
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import http2 from 'http2';
import path from 'path';
import { inspect, } from '../utils.lib.mjs';
import WebSocket from './WebSocket.mjs'
import logWriter from './logWriter.mjs';
import settings from '../config/settings.mjs';
import util from 'util';

// 调试信息打印工具
const debug = util.debuglog('debug:http2-server.mjs');
const paths = settings.paths;
const sessionStore = new Map();  // 存储器

const server = http2.createSecureServer({
  allowHTTP1: true,
  //ca: [fs.readFileSync('client-cert.pem')],
  key: settings.privateKey,
  cert: settings.cert,
  passphrase: settings.passphrase,

  // @todo: 客户端证书支持
  // 默认false,设置后需要客户端提供cert
  //requestCert: true, 
  
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  //origins: [],
  //privateKeyEngine
  //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
  handshakeTimeout: 120000, // milliseconds
  ticketKeys: crypto.randomBytes(48), 
  sessionTimeout: 300, // seconds
});

export const wss = new WebSocket(server); // 应用ws

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
  debug('keylog event: %o', {
    address: tlsSocket.remoteAddress,
    line: line.toString(),
  });
  logWriter(path.join(paths.LOG_PATH, 'ssl-keys.log'), line.toString());
});

// The 'newSession' event is emitted upon creation of a new TLS session. 
// This may be used to store sessions in external storage. 
// The data should be provided to the 'resumeSession' callback.
server.on('newSession', (sessionId, sessionData, cb) => {
  debug('newSession event is emitted.');
  sessionStore.set(sessionId.toString('hex'), sessionData);
  cb();
});

// event is emitted when the client sends a certificate status request. 
server.on('OCSPRequest', (certificate, issuer, cb) => {
  debug('OCSPRequest event');
  debug(crypto.Certificate.exportPublicKey(certificate));
  cb(null, null);
});

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

// he 'secureConnection' event is emitted after the handshaking process 
// for a new connection has successfully completed. 
server.on('secureConnection', tlsSocket => {
  debug('secureConnection');
  tlsSocket.alpnProtocol !== 'h2' && debug('tlsSocket: %o', {
    authorized: tlsSocket.authorized,
    alpnProtocol: tlsSocket.alpnProtocol,
    servername: tlsSocket.servername,
    ticket: tlsSocket.getTLSTicket(),
    //certificate: tlsSocket.getCertificate(),
    //cipher: tlsSocket.getCipher(),
  });
});

// event is emitted when an error occurs before a secure connection is established.
server.on('tlsClientError', (exception, tlsSocket) => {
  debug('tlsClientError: ', exception);
});

// endof tls server events

server.on('unknownProtocol', (error) => {
  debug('unknownProtocol');
});

server.on('stream', (stream, headers) => {

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

export default server;
