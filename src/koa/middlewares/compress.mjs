/**
 * *****************************************************************************
 *
 * 内容压缩支持
 *
 * 支持的可压缩的内容类别: String\Buffer
 *
 * @param {object} options 
 * @param {number} options.threshold
 * @return {function} middleware function
 * *****************************************************************************
 */

import zlib from 'zlib';

export default function compress (options = {}) {
  const opts = Object.assign({}, {
    threshold: 512*1024, // 512kb
    encodings: ['deflate', 'gzip', 'br'],
  }, options);

  return function compressMiddleware (ctx, next) {
    // 支持的压缩类型: Buffer/String
    if (!(Buffer.isBuffer(ctx.body) || typeof ctx.body === 'string')) return next();
    if (ctx.length && ctx.length <= opts.threshold) return next(); // threshold
    if (opts.encodings.include(ctx.get('content-encoding'))) return next();
    contentCompress(ctx); // 内容压缩算法
    return next();
  } 
} 

/**
 * 内容压缩算法
 * algrythem
 */

export function contentCompress (ctx) {
  ctx.set('vary', 'accept-encoding');
  const body = ctx.body; // get ctx.body
  const encoding = ctx.get('accept-encoding');

  if (/\bdeflate\b/.test(encoding)) {
    ctx.set('content-encoding', 'deflate');
    ctx.body = zlib.deflateCompressSync(body);
  } else if (/\bgzip\b/.test(encoding)) {
    ctx.set('content-encoding', 'gzip');
    ctx.body = zlib.gzipSync(ctx.body);
  } else if (/\bbr\b/.test(encoding)) {
    ctx.set('content-encoding', 'br');
    ctx.body = zlib.brotliCompressSync(ctx.body);
  } 

  ctx.length = Buffer.byteLength(ctx.body); // 重新计算内容大小
}
