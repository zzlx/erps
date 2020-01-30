/**
 * http2 server
 */

import fs from 'fs'; 
import http2 from 'http2';
import tls from 'tls';
import util from 'util';
import cp from 'child_process';
const debug = util.debuglog('debug:server');

const server = http2.createSecureServer({
  //ca: [fs.readFileSync('client-cert.pem')],
  cert: fs.readFileSync('/etc/ssl/localhost-cert.pem'),
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  key:  fs.readFileSync('/etc/ssl/localhost-key.pem'),
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

server.on('listening', function () {
  const sys_info = {
    title: process.title,
    ppid: process.ppid,
    pid: process.pid,
    mode: process.env.NODE_ENV,
    address: this.address(),
  };

  console.log('Server is running...\nprocess_info: %o', sys_info);
});

server.on('keylog', function (line, socket) {
  const info = {
    line: line.toString(),
    address: socket.remoteAddress,
  };

  debug('keylog event: %j', info);
});

server.on('newSession', function (sessionId, sessionData, cb) {
  // bind session id
  const id = sessionId.toString('hex');
  this.sessionID = id;
  tlsSessionStore[id] = sessionData;
  cb();
});

server.on('OCSPRequest', function (certificate, issuer, cb) {
  //const test = tls.checkServerIdentity('localhost', certificate);
  //console.log('cert: ', test);
  //console.log('certificate', certificate.toString('base64'));
  cb(null, null);
});

server.on('resumeSession', function (sessionId, callback) {
  debug('ticketkey:', this.getTicketKeys());
  const id = sessionId.toString('hex');
  this.sessionID = id;
  callback(null, tlsSessionStore[id] || null );
});

server.on('secureConnection', function (tlsSocket) {
  debug('tlsSocket: ', tlsSocket);
});

// This event is emitted when an error occurs before a secure connection.
server.on('tlsClientError', function (exception, tlsSocket) {
  debug('tlsClientError: %o \ntlsSocket: %o', exception, tlsSocket);
});

server.on('unknownProtocol', function () {
});

server.on('close', function () {
  console.log('Server is closed.');
});

// export server 
export default server;
