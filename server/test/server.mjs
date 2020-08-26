/**
 * *****************************************************************************
 *
 * HTTP2服务器配置
 *
 * @todos:
 * session支持
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import util from 'util';

import app from './main.mjs';
import config from './config.js';

const debug = util.debuglog('debug:http2-server');

// server session缓存
const tlsSessionStore = {};
const hostname = os.hostname();

const server = http2.createSecureServer({
  key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
  cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
  allowHTTP1: true,
  //ca: [fs.readFileSync('client-cert.pem')],
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  //privateKeyEngine
  //passphrase: 'sample',
  //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
});

server.on('keylog', (line, socket) => {
  const info = {
    line: line.toString(),
    address: socket.remoteAddress,
  };

});

// The 'session' event is emitted when a new Http2Session is created by the Http2SecureServer.
server.on('session', function () {

});

server.on('newSession', function newSessionEventHandler (sessionId, sessionData, cb) {
  debug('newSessionEvent');
  const id = sessionId.toString('hex');
  tlsSessionStore[id] = sessionData;
  cb();
});

server.on('OCSPRequest', function OCSPRequestEventHandler (certificate, issuer, cb) {
  debug('OCSPRequest');
  debug(certificate);
  debug(issuer);
  //const test = tls.checkServerIdentity('localhost', certificate);
  //debug('cert: ', test);
  //debug('certificate', certificate.toString('base64'));
  cb(null, null);
});

server.on('resumeSession', (sessionId, cb) => {
  debug('resumeSessionEvent');
  const id = sessionId.toString('hex');
  cb(null, tlsSessionStore[id] || null );
});

// The 'stream' event is emitted when a 'stream' event has been emitted by an Http2Session associated with the server.
server.on('stream', app.callback());

// The 'timeout' event is emitted when there is no activity on the Server for a given number of milliseconds set using http2secureServer.setTimeout(). Default: 2 minutes.
server.on('timeout', function () {
  
});

server.on('error', function (err) {
  if (err.code == 'EADDRINUSE') {
    debug('%s is already running on port %s, it can be restarted later.', 
      process.title,
      err.port,
    );

    process.exit(); // exit 
  }
});

server.on('listening', function () {
  //let time = cp.execSync('date "+%Y%m%d"').toString().replace(/\s/, '');
  const address = this.address();

  debug('%s %s(with PID %s) is running in %s mode, address %s:%s.',
    new Date(),
    process.title,
    process.pid,
    process.env.NODE_ENV,
    address.address,
    address.port,
  );
});

export default server;
