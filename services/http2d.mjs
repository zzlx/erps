/**
 * *****************************************************************************
 *
 * Http Daemon
 * ===========
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

import '../src/processSettings.mjs'; // 载入进程管理模块
import app from './routes/main.mjs';
import config from '../config/settings.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`);
process.title = `${config.pidPrefix}.${path.basename(__filename, path.extname(__filename))}`;

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
  console.log('Server is running in %s mode. %o', process.env.NODE_ENV, this.address());
});

server.on('error', function(err) {
  if (err.code === 'EADDRINUSE') {
    console.info(`Address ${err.address}:${err.port} is in use, try again later.`)
  }
});

server.on('stream', app.callback());
server.on('listening', function () {
  // after the server started successfully, record pid to pidfile.
  // recordPid().catch((err) => debug(err));
});

server.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: config.system.host,
  port: config.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
});
