/**
 * *****************************************************************************
 *
 * DRS Middleware
 * ==============
 *
 * DRS(Dynamic resource service,动态资源服务).
 *
 * ## 功能特性 
 *
 * *****************************************************************************
 */ 

import fs from 'fs';
import path from 'path';
import util from 'util';
import { HTTP_STATUS } from '../constants.mjs';

export default function dynamics (options = {}) {
  const opts = Object.assign({
    directoryIndex: ['index.html', 'index.mjs'],
    immutable: false,
    maxAge: 3600, // 默认缓存1小时(3600s)
    prefix: '/',
    path: null,
  }, typeof options === 'string' ? { path: options } : options);

  if (opts.path == null) throw new Error('Static service`s path path is not set.');

  if ('string' === typeof opts.directoryIndex) {
    opts.directoryIndex = opts.directoryIndex.split(',');
  }

  if (!Array.isArray(opts.directoryIndex)) opts.directoryIndex = false;

  return async function dynamicsMiddleware (ctx, next) {
    if (ctx.body != null) return next(); // ctx.body 已经设置

    let apiFile = path.join(opts.path, path.relative('/', ctx.pathname) + '.mjs');

    if (!fs.existsSync(apiFile)) apiFile = path.join(opts.path, 'index.mjs');

    const api = await import(apiFile).then(m => m.default);
    await api.call(ctx, ctx);
    return next();
  }
}
