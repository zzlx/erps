/**
 * *****************************************************************************
 *
 * SRS Middleware
 * ==============
 *
 * 静态资源服务(Static resource service,SRS), 提供托管静态资源服务功能.
 *
 * ## 功能特性 
 *
 * * 支持内容协商: 静态资源压缩版本选择
 * * 支持服务缓存策略: ETag响应等
 * * 仅支持GET、HEAD两种请求方法
 *
 * @param {string} root, The root directory from which to serve static assets.
 * @param {object} options
 * @return {function} middleware
 * *****************************************************************************
 */ 

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { HTTP_STATUS } from '../constants.mjs';
import etag from '../etag.mjs';

export default function statics (root, options = {}) {
  assert('string' === typeof root, 'The root directory must be setting.');

  const opts = Object.assign({
    contentNegotiation: true,
    dotfiles: 'ignore',
    etag: true,
    //directoryIndex: [ 'index.html' ],
    extensions: [ 'html' ],
    index: false,
    immutable: false,
    maxAge: 3600, // 默认缓存1小时(3600s)
    prefix: '/',
    redirect: true, // 默认会重定向到索引文件
  }, options);

  if ('string' === typeof opts.directoryIndex) {
    opts.directoryIndex = opts.directoryIndex.split(',');
  } else if (opts.directoryIndex == null) {
    opts.directoryIndex = [ 'index.html' ];
  }

  if (!Array.isArray(opts.directoryIndex)) opts.directoryIndex = false;

  return function staticsMiddleware (ctx, next) {
    // 旁路规则:
    // 1. 非GET、HEAD请求方法时
    // 2. body已被设置时
    // 3. 旁路前缀不匹配时的情况
    if (!/GET|HEAD/.test(ctx.method)) return next(); 
    if (ctx.body != null) return next(); 
    if (ctx.pathname.substr(0, opts.prefix.length) !== opts.prefix) return next();

    // Response static resource:
    const relativePath = path.relative(opts.prefix, ctx.pathname);
    const absolutePath = path.resolve(root, relativePath);

    // 实际文件路径
    let url = absolutePath;

    if (path.extname(url) === '' && fs.existsSync(url)) {
      // 匹配目录索引文件
      for (const index of opts.directoryIndex) {
        const indexPath = path.join(url, index);
        if (fs.existsSync(indexPath)) { 
          url = indexPath; 
          // 重定向
          if (opts.redirect) {
            const location = path.join(opts.prefix, path.relative(root, url));
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

    // @TODOS:
    if (path.basename(url) === '_React.mjs') url = path.join(path.dirname(url), '_React.browser.mjs');

    // Set content type
    ctx.type = path.extname(url);

    // 内容协商算法:
    // Vary 是一个HTTP响应头部信息，
    // 它决定了对于未来的一个请求头，
    // 应该用一个缓存的回复(response)还是向源服务器请求一个新的回复。
    // 在响应状态码为 304 Not Modified  的响应中，
    // 也要设置 Vary 首部，而且要与相应的 200 OK 响应设置得一模一样。
    ctx.set('vary', 'User-Agent');

    // 内容协商: 编码格式
    if (opts.contentNegotiation) {
      const encodings = ctx.get('accept-encoding').split(/\b,\s?/);

      for (const encoding of encodings) {
        if ('br' === encoding && fs.existsSync(url + '.br')) {
          ctx.set('content-encoding', 'br');
          url += '.br';
          break;
        }

        if ('gzip' === encoding && fs.existsSync(url + '.gz')) {
          ctx.set('content-encoding', 'gzip');
          url += '.gz';
          break;
        }

        if ('deflate' === encoding && fs.existsSync(url + '.deflate')) {
          ctx.set('content-encoding', 'deflate');
          url += '.deflate';
          break;
        }
      }
    }

    const stats = fs.lstatSync(url);
    const ETag = etag(stats); 

    if (ctx.get('if-none-match') === ETag) {
      ctx.status = HTTP_STATUS.NOT_MODIFIED; // 304
      return next();
    }

    // 客户端缓存配置
    opts.etag && ctx.set('etag', ETag);

    ctx.set({
      //'last-modified': stats.mtime, // 开启浏览器端缓存
      //'cache-control': `max-age=${ctx.app.env === 'development' ? 0 : opts.maxAge}`,
    }); 

    // 如果内容大于app.opts.streamThreshold,启用stream传输
    if (stats.size > ctx.app.opts.streamThreshold) {
      ctx.length = stats.size;
      ctx.body = fs.createReadStream(url, { emitClose: true, autoClose: true,});
    } else {
      ctx.body = fs.readFileSync(url);
    }

    return next();
  }
}
