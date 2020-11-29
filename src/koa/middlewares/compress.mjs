/**
 * *****************************************************************************
 *
 * content compress support
 *
 * @param {object} options 
 * @param {number} options.threshold
 * @return {function} middleware function
 * *****************************************************************************
 */

import zlib from 'zlib';

export default function compress (options) {
  const opts = Object.assign({
    // supported formats
    compressFormats: ['', '.html', '.css', '.js', '.mjs', '.doc'],
  }, options)

  return function compressMiddleware (ctx, next) {
    if (ctx.get('content-encoding')) return next();
    if (ctx.length && ctx.length <= ctx.app.opts.compressThreshold) return next();
    if (!(Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string')) return next();

    ctx.set('vary', 'accept-encoding');

    // compress algorithm
    const encodings = ctx.get('accept-encoding').split(/\b,\s?/);
    const body = ctx.body;

    for (const encoding of encodings) {
      if (encoding === 'gzip') {
        ctx.set('content-encoding', 'gzip');
        ctx.body = zlib.gzipSync(ctx.body);
        break;
      }

      if (encoding === 'deflate') {
        ctx.set('content-encoding', 'deflate');
        ctx.body = zlib.deflateSync(ctx.body);
        break;
      }

      if (encoding === 'br') {
        ctx.set('content-encoding', 'br');
        ctx.body = zlib.brotliCompressSync(ctx.body);
        break;
      }

    }

    return next();
  } 
} 
