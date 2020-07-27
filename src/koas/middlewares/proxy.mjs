/**
 * *****************************************************************************
 *
 * proxy
 *
 * 1. 支持代理及反向代理配置
 * 2. 自适应支持相应协议版本
 *
 * *****************************************************************************
 */

import http2 from 'http2';
import http from 'http';
import util from 'util';

const debug = util.debuglog('debug:proxy-middleware');

export default function (opts) {
  return async function proxyMiddleware (ctx, next) {

    const req = http.get({
      hostname: 'localhost',
      port: 3000,
      path: ctx.pathname,
      agent: false
    }, res => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        ctx.set('content-type', res.headers['content-type']);
        ctx.stream.respond(ctx._headers);
        ctx.stream.end(rawData);
      })
    });

    await next();
  } 
} 
