/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import Stream from 'stream';
import util from 'util';

const debug = util.debuglog('debug:respond.mjd');
const emptyStatus = [ 204, 205, 304 ];

export default function respond (ctx) {
  let body = ctx.body;
  debug(body);

  // allow bypassing response
  if (ctx.respond === false) return; 
  if (emptyStatus.includes(ctx.status)) return ctx.stream.end();
  if ('HEAD' === ctx.method) return ctx.stream.end();

  if (null == body) {
    ctx.status = ctx.status || 404;
    body = ctx.message;
  }

  // response header
  if (ctx.headersSent === false) {
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
