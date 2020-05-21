/**
 * *****************************************************************************
 *
 * http2 server配置
 *
 * *****************************************************************************
 */

import util from 'util';
const debug = util.debuglog('debug:http2Server');

export default function http2Server (server) {
  const tlsSessionStore = {};

  server.on('keylog', function (line, socket) {
    const info = {
      line: line.toString(),
      address: socket.remoteAddress,
    };
  });

  server.on('newSession', function (sessionId, sessionData, cb) {
		debug('newSession:', sessionId);
    // bind session id
    const id = sessionId.toString('hex');
    this.sessionID = id;
    tlsSessionStore[id] = sessionData;
    cb();
  });

  server.on('OCSPRequest', function (certificate, issuer, cb) {
		debug('OCSPRequest');
    //const test = tls.checkServerIdentity('localhost', certificate);
    //console.log('cert: ', test);
    //console.log('certificate', certificate.toString('base64'));
    cb(null, null);
  });

  server.on('resumeSession', function (sessionId, callback) {
		debug('resumeSession');
		console.log('resumeSession');
    //debug('ticketkey:', this.getTicketKeys());
    const id = sessionId.toString('hex');
    this.sessionID = id;
    callback(null, tlsSessionStore[id] || null );
  });

  server.on('error', (err) => {
    if (err.code == 'EADDRINUSE') {
      console.log('端口%s被占用, 请更换端口后重试...', err.port);
			process.exit();
		}
  });

  server.on('listening', function () {
		//let time = cp.execSync('date "+%Y%m%d"').toString().replace(/\s/, '');
    debug(
      'Http服务正在运行...\n%o', 
			{
				title: process.title,
				pid: process.pid,
				mode: process.env.NODE_ENV,
				address: this.address(), // 当前监听地址
			},
    );
  });

}
