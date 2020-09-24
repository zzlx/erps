/**
 * *****************************************************************************
 *
 * Http2 Server
 * =============
 *
 * ERP服务后台管理程序(ERP Services Daemon, ERPSD),
 * 用于管理ERP各项服务的启动、关闭、重启等任务.
 *
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import util from 'util';

import settings from '../src/config/settings.mjs';
import streamHandler from './routes/main.mjs';
import { console } from '../src/utils.mjs';

const debug = util.debuglog('debug:http2d.mjs');
const __filename = import.meta.url.substr(7);
const paths = settings.paths;
const sessionStore = {};
let server = null;

// process settings
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.title = `${path.basename(__filename, path.extname(__filename))}`;
process.on('exit', code => {
  debug(`${process.title}(PID:${process.pid}) is exit with code ${code}.`);
});
// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.error('Caught exception: %o', error);
  console.error('Origin exception: %s', origin);
});
// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection: %o', reason);
});

process.nextTick(() => {
  server.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: settings.system.host,
    port: settings.system.port,
    exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
  });
});

server = http2.createSecureServer({
  key: settings.privateKey,
  cert: settings.cert,
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
  sessionTimeout: 300, // seconds
  handshakeTimeout: 120000, // milliseconds
});

attachServerEvent(server);

// attach
function attachServerEvent (server) {
  const keylogFile = fs.createWriteStream(path.join(paths.TMP, 'ssl-keys.log'), {flags: 'a+'});

  server.on('keylog', (line, tlsSocket) => {
    debug('keylog event with line:', line.toString());
    keylogFile.write(line);
  });

  server.on('secureConnection', socket => {
    debug('secureConnection event ');
  });

  server.on('newSession', (id, data, cb) => {
    debug('newSession event with sessionId: %s', id.toString('hex'));
    sessionStore[id.toString('hex')] = data;
    cb();
  });

  server.on('OCSPRequest', (certificate, issuer, callback) => {
    debug('OCSPRequest event with certificate: %o, and issuer: %o', 
      certificate.toString('hex'),
      issuer,
    );
    callback();
  });

  server.on('resumeSession', (id, cb) => {
    debug('resumeSession event with id: %s', id.toString('hex'));
    cb(null, sessionStore[id.toString('hex')] || null);
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

  server.on('listening', function () {
    console.clearLine();
    console.log('The %s Server is running on %o.', process.env.NODE_ENV, this.address());
  });

  server.on('stream', (stream, headers, flags) => {
    debug('new stream event with flags:', flags); // flags: 37
    attachStreamEvents(stream);
    streamHandler(stream, headers, flags);
  });
}

function attachStreamEvents (stream) {
  stream.on('aborted', () => {
    debug('Stream is aborted.');
  });

  stream.on('close', () => {
    debug('Stream is closed.');
  });

  stream.on('error', error => {
    debug('Stream error: ', error);
  });

  stream.on('frameError', (err) => {
    debug('Stream frameError: ', err);
  });

  stream.on('ready', () => {
    debug('Stream is ready.');
  });

  stream.on('timeout', () => {
    debug('Stream is timeout.');
  });

  stream.on('trailers', (headers, flags) => {
    debug(headers);
  });

  stream.on('wantTrailers', () => {
    debug('Stream want trailers.');
  });
}
