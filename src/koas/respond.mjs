/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import Stream from 'stream';

const emptyStatus = [ 204, 205, 304 ];

export default function respond (ctx) {
  let body = ctx.body;
  const stream = ctx.stream;

  // allow bypassing response
  if (ctx.respond === false) return; 
  if (!ctx.writable) return stream.end();
  if (emptyStatus.includes(ctx.status)) return stream.end();
  if ('HEAD' === ctx.method) return stream.end();

  if (null == body) {
    ctx.status = ctx.status || 404;
    body = ctx.message;
  }

  // response header
  if (!ctx.headersSent) {
    const headers = ctx.response.headers;
    stream.respond(headers, {
      endStream: emptyStatus.includes(ctx.status) ? true : false, 
      waitForTrailers: false 
    });
  }

  if (Buffer.isBuffer(body)) return stream.end(body);
  if ('string' === typeof(body)) return stream.end(body);
  if (body instanceof Stream) return body.pipe(stream);

  return stream.end();
}
