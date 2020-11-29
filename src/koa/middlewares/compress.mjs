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
    console.log(ctx.type);

    ctx.set('vary', 'accept-encoding');

    const body = ctx.body;
    const encoding = ctx.get('accept-encoding');

    // compress algorithm
    if (/\bbr\b/.test(encoding)) {
      ctx.set('content-encoding', 'br');
      ctx.body = zlib.brotliCompressSync(ctx.body);
    } else if (/\bgzip\b/.test(encoding)) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = zlib.gzipSync(ctx.body);
    }

    return next();
  } 
} 
