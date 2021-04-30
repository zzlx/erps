/**
 * *****************************************************************************
 *
 * Compress middleware
 *
 * @param {object} options 
 * @param {number} options.threshold
 * @return {function} middleware function
 * *****************************************************************************
 */

import zlib from 'zlib';

export function compress (options) {
  const opts = Object.assign({
    compressFormats: ['', '.html', '.css', '.js', '.mjs', '.doc'], // supported formats
    threshold: 500*1024, // 500kb
  }, options)

  return function compressMiddleware (ctx, next) {
    if (ctx.get('content-encoding')) return next();
    if (!(Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string')) return next();

    const threshold = ctx.app.opts.compressThreshold || opts.threshold;
    if (ctx.length && ctx.length <= threshold) return next();

    // Compress algorithm
    for (const encoding of ctx.get('accept-encoding').split(/\b,\s?/)) {
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
