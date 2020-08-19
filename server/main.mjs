/**
 * *****************************************************************************
 *
 * Backend services application
 *
 * 后端服务程序,用于解析http请求，并返回响应
 *
 * 服务器逻辑:
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import util from 'util';

import Koa from './koa/Application.mjs';
import cors from './koa/middlewares/cors.mjs';
import cookies from './koa/middlewares/cookies.mjs';
import error from './koa/middlewares/error.mjs';
import log from './koa/middlewares/log.mjs';
import xResponse from './koa/middlewares/xResponse.mjs';

import router from './routes.mjs';
import config from './config.mjs';

const debug = util.debuglog('debug:main.mjs');

const app = new Koa();
app.use(error());            // 捕获中间件级错误
app.use(log());              // request log
app.use(xResponse());        // 记录中间件响应时间
app.use(cors());             // 跨域访问
app.use(cookies());          // cookie读写及签名
app.use(router.routes());
app.use(router.allowedMethods());

export default http2.createSecureServer({
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
}).on('listening', function () {
  // listening event 

  console.log('Listening address: %o', this.address());

}).on('error', function(err) {
  // error event 

  debug(this);

  if (err.code === 'EADDRINUSE') {
    console.info(`Address ${err.address}:${err.port} is in use, try again later.`)
  }
}).on('stream', app.callback());
