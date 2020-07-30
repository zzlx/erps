/**
 * *****************************************************************************
 *
 * Backend services application
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import util from 'util';

import Koa from './koa/Application.mjs';

import error from './koa/middlewares/error.mjs';
import log from './koa/middlewares/log.mjs';
import xResponse from './koa/middlewares/xResponse.mjs';
import cookies from './koa/middlewares/cookies.mjs';
import cors from './koa/middlewares/cors.mjs';
import dba from './koa/middlewares/dba.mjs';
import statics from './koa/middlewares/statics.mjs';

import config from './config.js';
import router from './routes/index.mjs';

const debug = util.debuglog('debug:main.mjs');
const app = new Koa({
  env: process.env.NODE_ENV || 'production',
});

app.use(error());            // 捕获中间件级错误
app.use(log());              // request log
app.use(xResponse());        // 记录中间件响应时间
app.use(cookies());          // cookie读写及签名
app.use(cors());             // 跨域访问响应
app.use(dba(config));        // 数据库管理
app.use(statics(config.paths.public));

//app.use(router.routes());
//app.use(router.allowedMethods());

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

server.on('stream', app.callback());

export default server;
