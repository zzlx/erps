/**
 * *****************************************************************************
 *
 * Compress middleware
 *
 * @param {object} options 
 * @param {number} options.threshold
 * @return {function} middleware function
 *
 * *****************************************************************************
 */

import zlib from 'zlib';

export function compress (options) {
  const opts = Object.assign({
    compressFormats: ['', '.html', '.css', '.js', '.mjs', '.doc'], // supported formats
    threshold: 100*1024, // 100kb
  }, options)

  return function compressMiddleware (ctx, next) {
    if (ctx.get('content-encoding')) return next();
    if (!(Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string')) return next();

    if (ctx.length && ctx.length <= opts.threshold) return next();

    // Compress algorithm
    //
    // accept-encoding array
    const aea = ctx.get('accept-encoding').split(/\b,\s?/);

    if (aea.includes('br')) {
      ctx.set('content-encoding', 'br');
      ctx.body = zlib.brotliCompressSync(ctx.body);
    } else if (aea.includes('deflate')) {
      ctx.set('content-encoding', 'deflate');
      ctx.body = zlib.deflateSync(ctx.body);
    } else if (aea.includes('gzip')) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = zlib.gzipSync(ctx.body);
    }

    /*
    // use accept-encoding reverse order
    for (const encoding of ctx.get('accept-encoding').split(/\b,\s?/).reverse()) {
      if (encoding === 'br') {
        break;
      }

      if (encoding === 'deflate') {
        break;
      }

      if (encoding === 'gzip') {
        break;
      }
    }
    */

    return next();
  } 
} 
