/**
 * *****************************************************************************
 *
 * Http2 Daemon
 * ============
 *
 * ERP服务后台管理程序(ERP Services Daemon, ERPSD),
 * 用于管理ERP各项服务的启动、关闭、重启等任务.
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import util from 'util';

import streamHandler from './routes/main.mjs';
import settings from '../src/config/settings.mjs';

const debug = util.debuglog('debug:http2d.mjs');
const __filename = import.meta.url.substr(7);

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.title = `${path.basename(__filename, path.extname(__filename))}`;

const server = http2.createSecureServer({
  key: fs.readFileSync(`/etc/ssl/${os.hostname()}-key.pem`),
  cert: fs.readFileSync(`/etc/ssl/${os.hostname()}-cert.pem`),
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

server.on('listening', function () {
  // listening event 
  console.log('The %s Server is running on %o.', process.env.NODE_ENV, this.address());
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

server.on('stream', streamHandler);

server.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.host,
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
});
