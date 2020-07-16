/**
 * *****************************************************************************
 *
 * HTTP2服务配置
 *
 * @todos:
 * session支持
 *
 *
 * *****************************************************************************
 */

import http2 from 'http2';
import util from 'util';
const debug = util.debuglog('debug:server.http2');

// server session缓存
const tlsSessionStore = {};

export default function http2Server (opts) {
	const server = http2.createSecureServer({
		cert: opts.cert,
		key: opts.key,
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
    
		// This is necessary only if using client certificate authentication.
		//requestCert: true,
	});

  server.on('keylog', keylogEventHandler);
  server.on('newSession', newSessionEventHandler);
  server.on('OCSPRequest', OCSPRequestEventHandler);
  server.on('resumeSession', resumeSessionEventHandler);
  server.on('error', errorEventHandler);
  server.on('listening', listeningEventHandler);

	return server
}

function keylogEventHandler (line, socket) {
  const info = {
    line: line.toString(),
    address: socket.remoteAddress,
  };
}

function newSessionEventHandler (sessionId, sessionData, cb) {
	debug('newSessionEvent');
  const id = sessionId.toString('hex');
  tlsSessionStore[id] = sessionData;
  cb();
}

function OCSPRequestEventHandler (certificate, issuer, cb) {
	debug('OCSPRequest');
  debug(certificate);
  debug(issuer);
  //const test = tls.checkServerIdentity('localhost', certificate);
  //debug('cert: ', test);
  //debug('certificate', certificate.toString('base64'));
  cb(null, null);
}

function resumeSessionEventHandler (sessionId, cb) {
	debug('resumeSessionEvent');
  const id = sessionId.toString('hex');
  cb(null, tlsSessionStore[id] || null );
}

function errorEventHandler (err) {
  if (err.code == 'EADDRINUSE') {
    console.warn('Port %s is used, try again later...', err.port);
		process.exit();
	}
}

function listeningEventHandler () {

	//let time = cp.execSync('date "+%Y%m%d"').toString().replace(/\s/, '');
	const address = this.address();

  debug('%s %s(PID %s) is running in %s mode, and listening address %s:%s.',
    new Date(),
		process.title,
		process.pid,
		process.env.NODE_ENV,
		address.address,
		address.port,
	);
}
