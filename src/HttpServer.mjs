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

import EventEmitter from 'events'; 
import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import util from 'util';
import app from './services/main.mjs';

const debug = util.debuglog('debug:http2-server');
// server session缓存
const tlsSessionStore = {};
const hostname = os.hostname();

export default class HttpServer extends EventEmitter {

  constructor(opts = {}) {
    super();

    this.options = Object.assign({}, { // default opts
      cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
      key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
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
    }, opts);

    this.server = http2.createSecureServer(this.options);

    this.server.on('keylog', (line, socket) => {
      const info = {
        line: line.toString(),
        address: socket.remoteAddress,
      };
    });



    this.server.on('newSession', function newSessionEventHandler (sessionId, sessionData, cb) {
      debug('newSessionEvent');
      const id = sessionId.toString('hex');
      tlsSessionStore[id] = sessionData;
      cb();
    });

    this.server.on('OCSPRequest', function OCSPRequestEventHandler (certificate, issuer, cb) {
      debug('OCSPRequest');
      debug(certificate);
      debug(issuer);
      //const test = tls.checkServerIdentity('localhost', certificate);
      //debug('cert: ', test);
      //debug('certificate', certificate.toString('base64'));
      cb(null, null);
    });

    this.server.on('resumeSession', (sessionId, cb) => {
      debug('resumeSessionEvent');
      const id = sessionId.toString('hex');
      cb(null, tlsSessionStore[id] || null );
    });

    this.server.on('stream', app.callback());

    this.server.on('error', function (err) {

      if (err.code == 'EADDRINUSE') {
        console.warn('port %s is used, try again later...', err.port);
        process.exit();
      }
    });

    this.server.on('listening', function () {
      //let time = cp.execSync('date "+%Y%m%d"').toString().replace(/\s/, '');
      const address = this.address();

      debug('%s %s(with PID %s) is running in %s mode and at address %s:%s.',
        new Date(),
        process.title,
        process.pid,
        process.env.NODE_ENV,
        address.address,
        address.port,
      );
    });
  }

  listen () {
    this.server.listen(...arguments);
  }
}
