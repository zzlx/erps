/**
 * http2 server
 *
 *
 */

import fs from 'fs'; 
import http2 from 'http2';
import tls from 'tls';
import util from 'util';
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

/**
 * @todo: 端口号被占用时处理逻辑: 
 * 1. 询问是否关闭被占用的进程,重新启动服务；
 * 2. 或使用其他的端口（提供两种选择，一是用户键入端口号，二是使用+1的端口号） 
 */

server.on('error', function (err) {

		if (process.env.NODE_ENV === 'development') {
			console.log(JSON.stringify(err));
		}

		if (err.errno === 'EADDRINUSE') {
			// set api port
			process.env.API_PORT = err.port;
			console.log('Port %s was be used. try %s ...', err.port, err.port + 1);
		}

		if (err.errno === 'ENOENT') {
			console.log('ENOENT');
		}

		// try restart server listing.
		/*
		setTimeout(() => {
			this.listen({port: err.port + 1});
		}, 500)
		*/
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
