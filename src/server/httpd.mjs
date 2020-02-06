#!/usr/bin/env node --no-warnings

/**
 * http2 daemon
 *
 * @file httpd.mjs
 */
/******************************************************************************/

// node内置模块
import cluster from 'cluster';
import http2 from 'http2';
import fs from 'fs'; 
import os from 'os';
import tls from 'tls';
import util from 'util';

// 本地模块
import '../env.mjs';
import App from '../apis/index.mjs';
import console from '../utils/console.mjs';

const debug = util.debuglog('debug:server');
const streamHandler = App.streamHandler();
const numCUPs = os.cpus().length;

const server = http2.createSecureServer({
  //ca: [fs.readFileSync('client-cert.pem')],
  cert: fs.readFileSync('/etc/ssl/localhost-cert.pem'),
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  key: fs.readFileSync('/etc/ssl/localhost-key.pem'),
  //privateKeyEngine
  //passphrase: 'sample',
  //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
  allowHTTP1: true,
  // This is necessary only if using client certificate authentication.
  //requestCert: true,
  //enableConnectProtocol: true
});

// secure context
//const secureContext = tls.createSecureContext(options);


/**
 * session storage.
 */

const tlsSessionStore = {};

/**
 *
 */

server.on('keylog', function (line, socket) {
  const info = {
    line: line.toString(),
    address: socket.remoteAddress,
  };

  //debug('keylog event: %j', info);
});

/**
 *
 *
 */

server.on('newSession', function (sessionId, sessionData, cb) {
  // bind session id
  const id = sessionId.toString('hex');
  this.sessionID = id;
  tlsSessionStore[id] = sessionData;
  cb();
});

/**
 *
 */

server.on('OCSPRequest', function (certificate, issuer, cb) {
  //const test = tls.checkServerIdentity('localhost', certificate);
  //console.log('cert: ', test);
  //console.log('certificate', certificate.toString('base64'));
  cb(null, null);
});

/**
 *
 */

server.on('resumeSession', function (sessionId, callback) {
  //debug('ticketkey:', this.getTicketKeys());
  const id = sessionId.toString('hex');
  this.sessionID = id;
  callback(null, tlsSessionStore[id] || null );
});

/**
 *
 */

server.on('secureConnection', function (tlsSocket) {
  //debug('tlsSocket: ', tlsSocket);
});

// This event is emitted when an error occurs before a secure connection.
server.on('tlsClientError', function (exception, tlsSocket) {
  //debug('tlsClientError: %o \ntlsSocket: %o', exception, tlsSocket);
});

/**
 *
 */

server.on('unknownProtocol', function () {
});

/**
 *
 */

server.on('close', function () {
  console.log('Server is closed.');
});

/**
 *
 */

server.on('error', (err) => {
  if (err.errno == 'EADDRINUSE')
    console.log('Port %s was be used.', err.port);
    process.exit();
});

/**
 * 
 */

server.on('stream', streamHandler);

/**
 *
 */

server.on('listening', function () {
  const sys_info = {
    title: process.title,
    pid: process.pid,
    address: this.address(), // 当前监听地址
  };

  console.log(
    'Server is running in %s mode.\n%o', 
    process.env.NODE_ENV,
    sys_info,
  );
});

/**
 * 开启服务器监听
 */

server.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  exclusive: false, // 是否共享进程端口
});

