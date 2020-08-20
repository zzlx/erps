/**
 * *****************************************************************************
 *
 * Statics中间件
 *
 * 功能描述:
 *
 * 静态资源服务
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

export default function statics (options = {}) {
  const opts = Object.assign({}, {
    compress: false,
    directoryIndex: ['index.html'],
    immutable: false,
    index: 'index.html',
    maxage: 0,
    root: null,
    rewrite: true, // 重定向
  }, typeof options === 'string' ? { root: options } : options);

  if (opts.root == null) throw new Error('opts.root is unconfigured.');

  return async function staticsMiddleware (ctx, next) {

    // only accept GET/HEAD/OPTIONS method
    if (!/(GET|HEAD|OPTIONS)/.test(ctx.method)) {
      ctx.status = 405; // method not allowed.
      ctx.set('Allow', 'GET, HEAD, OPTIONS');
      return await next();
    }

    // get relative path from pathname
    // set absolute path
    const relativePath = path.relative('/', ctx.pathname);
    const absolutePath = path.resolve(opts.root, relativePath);

    let url = absolutePath;
    let callbackURL = path.join(opts.root, 'index.html'); 

    // 路径构造逻辑
    // 不含文件扩展名的路径rewrite为callbackURL
    if (path.extname(url) === '') url = callbackURL;

    // @todo: 完善资源最后修改时间戳对比逻辑
    const lastModified = ctx.get('if-modified-since');

    // get accept encoding
    const accetpEncoding = ctx.get('accept-encoding');

    ctx.type = path.extname(url); // set content-type

    if (ctx.app.env === 'development') {
      // set no cache in development mode.
      ctx.set('cache-control', 'no-cache'); // 开发模式下no cache
    }

    // content negotiation
    if (/\bbr\b/.test(accetpEncoding) && fs.existsSync(url + '.br')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'br');
      url += '.br';
    } else if (/\bdeflate\b/.test(accetpEncoding) && fs.existsSync(url + '.deflate')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'deflate');
      url += '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(url + '.gz')) {
      ctx.set('vary', 'accept-encoding');
      ctx.set('content-encoding', 'gzip');
      url += '.gz';
    } else if (!fs.existsSync(url)) {
      ctx.status = 404;
      return await next();
    }

    const stats = fs.lstatSync(url);
    ctx.set('last-modified', new Date(stats.mtimeMs).toUTCString());
    ctx.body = fs.createReadStream(url);
  }
}
