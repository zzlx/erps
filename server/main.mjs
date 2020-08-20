/**
 * *****************************************************************************
 *
 * 服务端主程序
 * Backend services application
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http2 from 'http2';
import os from 'os';
import path from 'path';
import util from 'util';

import Koa from './koa/Application.mjs';

import cors from './koa/middlewares/cors.mjs';
import cookies from './koa/middlewares/cookies.mjs';
import error from './koa/middlewares/error.mjs';
import log from './koa/middlewares/log.mjs';
import xResponse from './koa/middlewares/xResponse.mjs';
import router from './routes.mjs'; // 路由配置

import config from './config.mjs';
import WriteStream from './utils/WriteStream.mjs';
import { date } from './utils.mjs'; // @todo: 

const debug = util.debuglog('debug:main.mjs');
const paths = config.paths;
const logWriter = new WriteStream();

const app = new Koa();
app.use(error());            // 捕获中间件级错误
app.use(log((log) => {
  // 按日期存档
  logWriter.path = path.join(paths.logPath, date.format('yyyymmdd') + '.log');
  logWriter.write(Object.values(log).join('\t') + '\n');
}));
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
