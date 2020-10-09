/**
 * *****************************************************************************
 *
 * Respond 客户端响应程序
 *
 * 响应客户端的流程必须放入此阶段执行，否则需要调试中间件逻辑
 *
 *
 * *****************************************************************************
 */

import Stream from 'stream';
import util from 'util';

const debug = util.debuglog('debug:respond.mjd');
const emptyStatus = [ 204, 205, 304 ];

export default function respond (ctx) {
  debug('执行客户端响应程序...');

  let body = ctx.body;

  // allow bypassing response
  if (ctx.respond === false) return; 
  if (emptyStatus.includes(ctx.status)) return ctx.stream.end();
  if ('HEAD' === ctx.method) return ctx.stream.end();

  if (null == body) {
    ctx.status = ctx.status || 404;
    body = ctx.message;
  }

  if (ctx.headersSent === false) { 
    // header response
    ctx.stream.respond(ctx.response.headers, {
      endStream: emptyStatus.includes(ctx.status) ? true : false, 
      waitForTrailers: false 
    });
  }

  if (ctx.writable === false) return ctx.stream.end();

  if (Buffer.isBuffer(body) || typeof body === 'string') {
    return ctx.stream.end(body);
  }

  if (body instanceof Stream) return body.pipe(ctx.stream);

  return ctx.stream.end();
}
