/**
 * *****************************************************************************
 *
 * SRS Middleware
 * ==============
 *
 * 静态资源服务(Static resource service,SRS), 提供静态资源服务器功能.
 *
 * ## 功能特性 
 *
 * * 支持内容协商: 静态资源压缩版本选择
 * * 支持服务缓存策略: ETag响应等
 * * 仅支持GET、HEAD两种请求方法
 *
 * *****************************************************************************
 */ 

import fs from 'fs';
import path from 'path';
import util from 'util';
import { HTTP_STATUS } from '../constants.mjs';

export default function statics (options = {}) {
  const opts = Object.assign({
    directoryIndex: 'index.html',
    immutable: false,
    maxAge: 3600, // 默认缓存1小时(3600s)
    prefix: '/',
    root: null,
    redirect: true, // 默认会重定向到索引文件
  }, typeof options === 'string' ? { root: options } : options);

  if (opts.root == null) throw new Error('Static service`s root path is not set.');
  if ('string' === typeof opts.directoryIndex) {
    opts.directoryIndex = opts.directoryIndex.split(',');
  }

  if (!Array.isArray(opts.directoryIndex)) opts.directoryIndex = false;

  return function staticsMiddleware (ctx, next) {
    // 旁路规则:
    if (!/GET|HEAD/.test(ctx.method)) return next(); // 1. 非GET、HEAD请求方法时
    if (ctx.body != null) return next(); // 2. body已被设置时

    // Response static resource:
    const relativePath = path.relative(opts.prefix, ctx.pathname);
    const absolutePath = path.resolve(opts.root, relativePath);
    let url = absolutePath;

    if (path.extname(url) === '' && fs.existsSync(url)) {
      // 匹配目录索引文件
      for (const index of opts.directoryIndex) {
        const indexPath = path.join(url, index);
        if (fs.existsSync(indexPath)) { 
          url = indexPath; 
          // 重定向
          if (opts.redirect) {
            const location = path.join(opts.prefix, path.relative(opts.root, url));
            ctx.set('location', location);
            ctx.status = HTTP_STATUS.TEMPORARY_REDIRECT; // 307
            return next();
          } else {
            break;
          }
        }
      }
    }

    // 未匹配到目录索引文件时不再响应
    if (path.extname(url) === '') return next(); 
    if (!fs.existsSync(url)) return next(); // 文件不存在时,不再响应

    ctx.type = path.extname(url);

    // 内容协商算法:
    // Vary 是一个HTTP响应头部信息，
    // 它决定了对于未来的一个请求头，
    // 应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。
    // 在响应状态码为 304 Not Modified  的响应中，
    // 也要设置 Vary 首部，而且要与相应的 200 OK 响应设置得一模一样。
    //ctx.set('vary', 'accept-encoding');
    ctx.set('vary', 'User-Agent');

    // 支持静态资源压缩版本
    const accetpEncoding = ctx.get('accept-encoding');

    if (/deflate/.test(accetpEncoding) && fs.existsSync(url + '.deflate')) {
      ctx.set('content-encoding', 'deflate');
      url += '.deflate';
    } else if (/\bgzip\b/.test(accetpEncoding) && fs.existsSync(url + '.gz')) {
      ctx.set('content-encoding', 'gzip');
      url += '.gz';
    } else if (/br/.test(accetpEncoding) && fs.existsSync(url + '.br')) {
      ctx.set('content-encoding', 'br');
      url += '.br';
    } 

    const stats = fs.lstatSync(url);
    const etag = `${stats.mtimeMs}`; 

    if (ctx.get('if-none-match') === etag) {
      ctx.status = HTTP_STATUS.NOT_MODIFIED; // 304
      return next();
    }

    // 客户端缓存配置
    ctx.set({
      'etag': etag, // 开启服务端资源验证逻辑
      //'last-modified': stats.mtime, // 开启浏览器端缓存
      'cache-control': `max-age=${ctx.app.env === 'development' ? 0 : opts.maxAge}`,
    }); 

    ctx.length = stats.size;
    ctx.body = fs.createReadStream(url);

    return next();
  }
}
