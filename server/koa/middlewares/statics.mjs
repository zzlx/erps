/**
 * *****************************************************************************
 *
 * Statics resource service.
 *
 * 内容协商
 * 缓存策略支持
 * 压缩版本支持
 *
 * @param {object|string} opts
 * @return {function} middleware function
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

const debug = util.debuglog('debug:statics-middleware');

export default function statics (opts = {}) {
  if (typeof opts === 'string') opts = { root: opts };

  const options = Object.assign({}, {
    index: 'index.html',
    directoryIndex: ['index.html'],
    immutable: false,
    maxage: 0,
    compress: false,
  }, opts);

  if (options.root == null) throw new Error('options.root is unconfigured.');

  return async function staticsMiddleware (ctx, next) {

    // only accept GET/HEAD/OPTIONS method
    if (!/(GET|HEAD|OPTIONS)/.test(ctx.method)) {
      ctx.status = 405; // method not allowed.
      ctx.set('Allow', 'GET, HEAD, OPTIONS');
      return await next();
    }

    // 相对目录
    const relativePath = path.relative('/', ctx.pathname);
    let realPath = path.resolve(options.root, relativePath);
    let url = null;

    if (realPath === options.root) {
      realPath = path.join(realPath, 'index.html');
    }

    if (fs.existsSync(realPath)) url = realPath;


    // @todo: 完善资源最后修改时间戳对比逻辑
    const lastModified = ctx.get('if-modified-since');

    // get accept encoding
    const accetpEncoding = ctx.get('accept-encoding');

    // 内容协商
    // set content-encoding
    if (/\bbr\b/.test(accetpEncoding) && fs.existsSync(realPath + '.br')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'br');
      url = realPath + '.br';
    } else if (/\bdeflate\b/.test(accetpEncoding) && fs.existsSync(realPath + '.deflate')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'deflate');
      url = realPath + '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(realPath + '.gz')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'gzip');
      url = realPath + '.gz';
    }

    // set content-type
    if (null === url || url === options.root) {
      url = path.join(options.root, 'index.html');
      ctx.type = path.extname(url);
    } else {
      ctx.type = path.extname(realPath);
    } 

    let stats = null;

    // 读取文件
    stats = fs.lstatSync(url);

    if (ctx.app.env === 'development') {
      // set no cache in development mode.
      ctx.set('cache-control', 'no-cache');
    }

    ctx.set('last-modified', new Date(stats.mtimeMs).toUTCString());
    ctx.body = fs.createReadStream(url);
  }
}
