import Stream from 'stream';
import zlib from 'zlib';
import util from 'util';

const debug = util.debuglog('debug:respond');
const isJSON = (value) => /^[\x20\x09\x0a\x0d]*(\[|\{)/.test(String(value));

/**
 * Respond
 */

export default function respond (ctx) {
  // Indicate the version of server environment.
  if ('development' === ctx.app.env) {
    ctx.set('X-Powered-By', `Node@${process.version}`);
  }

  // allow bypassing.
  if (false === ctx.respond) return; 

  if (!ctx.writable) return;

  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  // 204: no content
  // 205: reset content
  // 304: not modified
  const emptyCode = [204, 205, 304];
  if (emptyCode.includes(code)) {
    ctx.body = null;
    return ctx.stream.end();
  }

  if ('HEAD' == ctx.method || 'OPTIONS' == ctx.method) {
    if (!ctx.headersSent && !ctx.has('Content-Length')) {
      //ctx.length 
    }

    ctx.stream.respond(ctx._headers);
    return ctx.stream.end();
  }

  // status body
  if (null == body) {
    if (ctx.httpVersion >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }

    if (!ctx.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
      ctx.stream.respond(ctx._headers);
    }

    if (ctx.writable) {
      return ctx.stream.end(body);
    } else {
      return ctx.stream.end();
    }
  }

  // responses
  if (Buffer.isBuffer(body) || 'string' == typeof body) {
    ctx.stream.respond(ctx._headers);
    return ctx.stream.end(body);
  }

  if (body instanceof Stream) {
    ctx.stream.respond(ctx._headers);
    return body.pipe(ctx.stream);
  }

  // Assume body is a json value
  body = JSON.stringify(body);

  if (!ctx.headersSent) {
    ctx.length = Buffer.byteLength(body);

    // only compress filesize gretter than 100kb
    if (ctx.length > 1024 * 100) {
      if (/\bbr\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'br');
        ctx.set('vary', 'accept-encoding');
        body = zlib.brotliCompressSync(body);
        ctx.length = Buffer.byteLength(body);
      } else if (/\bdefate\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'deflate');
        ctx.set('vary', 'accept-encoding');
        body = zlib.deflateSync(body);
        ctx.length = Buffer.byteLength(body);
      } else if (/\bgzip\b/.test(ctx.get('accept-encoding'))) {
        ctx.set('content-encoding', 'gzip');
        ctx.set('vary', 'accept-encoding');
        body = zlib.gzipSync(body);
        ctx.length = Buffer.byteLength(body);
      }
    }
  }

  ctx.stream.respond(ctx._headers);
  ctx.stream.end(body);
}
