/**
 * *****************************************************************************
 *
 * HTTP2服务器
 *
 * @todos:
 * session支持
 *
 *
 * *****************************************************************************
 */

import http2 from 'http2';
import util from 'util';
const debug = util.debuglog('debug:http2-server');

export default function http2Server (opts) {

  const tlsSessionStore = {};
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

  server.on('keylog', function (line, socket) {
    const info = {
      line: line.toString(),
      address: socket.remoteAddress,
    };
  });

  server.on('newSession', function (sessionId, sessionData, cb) {
		debug('newSession:', sessionId.toString('hex'));
    // bind session id
    const id = sessionId.toString('hex');
    this.sessionID = id;
    tlsSessionStore[id] = sessionData;
    cb();
  });

  server.on('OCSPRequest', function (certificate, issuer, cb) {
		debug('OCSPRequest');
    //const test = tls.checkServerIdentity('localhost', certificate);
    //debug('cert: ', test);
    //debug('certificate', certificate.toString('base64'));
    cb(null, null);
  });

  server.on('resumeSession', function (sessionId, callback) {
    debug('resumeSession: ticketkey_', this.getTicketKeys().toString('hex'));
    const id = sessionId.toString('hex');
    this.sessionID = id;
    callback(null, tlsSessionStore[id] || null );
  });

  server.on('error', (err) => {
    if (err.code == 'EADDRINUSE') {
      console.warn('端口%s被占用, 请更换端口后重试...', err.port);
			process.exit();
		}
  });

  server.on('listening', function () {

		//let time = cp.execSync('date "+%Y%m%d"').toString().replace(/\s/, '');
		const address = this.address();

    debug('PID %s %s运行在%s模式,监听地址%s:%s',
			process.pid,
			process.title,
			process.env.NODE_ENV,
			address.address,
			address.port,
		);
  });

	return server
}
