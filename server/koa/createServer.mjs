/**
 * *****************************************************************************
 *
 * Kernel of services
 *
 * 服务核心程序
 *
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import http2 from 'http2';
import path from 'path';
import { inspect } from '../utils.lib.mjs';
import logWriter from './logWriter.mjs';
import settings from '../config/settings.mjs';
//import socket from 'socket.io';
import util from 'util';

// 调试信息打印工具
const debug = util.debuglog('debug:server.mjs');
const sessionStore = new Map();  // 存储器
const paths = settings.paths;

export default function createServer(opts) {
  const server = http2.createSecureServer({
    allowHTTP1: true,
    key: opts.key,
    cert: opts.cert,
    //ca: [fs.readFileSync('client-cert.pem')],
    //sigalgs: 
    //ciphers: 
    //clientCertEngine: 
    //dhparam
    //ecdhCurve
    //privateKeyEngine
    passphrase: opts.passphrase,
    //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
    sessionTimeout: 300, // seconds
    handshakeTimeout: 120000, // milliseconds
  });

  server.on('keylog', (line, tlsSocket) => {
    logWriter(path.join(paths.LOG_PATH, 'keylog.txt'), line.toString());
  });

  server.on('secureConnection', socket => {
    debug('secureConnection event ');
  });

  server.on('newSession', (id, data, cb) => {
    sessionStore.set(id.toString('hex'), data);
    try {
      console.log(String.fromCharCode(...data));
    } catch (err) {
      console.log(err);
    }
    cb();
  });

  server.on('OCSPRequest', (certificate, issuer, callback) => {
    debug('OCSPRequest event with certificate: %o, issuer: %o', 
      certificate.raw,
      issuer,
    );

    callback();
  });

  server.on('resumeSession', (id, cb) => {
    debug('resumeSession event with id: %s', id.toString('hex'));
    cb(null, sessionStore.get(id.toString('hex')) || null);
  });

  server.on('sessionError', err => {
    debug('sessionError');
  });

  server.on('unknownProtocol', socket => {
    debug('unknownProtocol');
  });

  server.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${err.port} is used, try again later.`);
    }
    debug(err);
  });

  server.on('close', function () {
    debug(this);
  });

  return server;
}
