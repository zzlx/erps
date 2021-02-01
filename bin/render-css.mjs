#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * Scss编译生成CSS
 *
 * 用于从src/scss目录生成css文件
 *
 * [参考文档](../../node_modules/sass/README.md)
 * [node-sass](https://github.com/sass/node-sass)
 *
 * @author: wangxuemin@zzlx.org
 * @file: src/main.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import debuglog from '../server/debuglog.mjs';
import settings from '../server/settings/index.mjs';

const debug = debuglog('debug:render-css');

renderCssFile(
  path.join(settings.paths.SRC, 'scss', 'styles.scss'),
  path.join(settings.paths.PUBLIC, 'assets', 'css', 'styles.css'),
);

/**
 * renderCssFile
 *
 * @param {} scssFile
 * @param {function} cb 
 */

function renderCssFile (scssFile, cssFile) {
  return import('sass').then(m => new Promise((resolve, reject) => {
    const sass = m.default;
    sass.render({
      file: scssFile,
      outputStyle: 'compressed', // 使用压缩模式
    }, (err, result) => { 
      if (err) reject(err);
      resolve(result);
    });
  })).then(res => {
    return Promise.all([
      fs.promises.writeFile(cssFile, res.css),
      fs.promises.writeFile(cssFile + '.gz', zlib.gzipSync(res.css)),
      fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(res.css)),
      fs.promises.writeFile(cssFile + '.deflate', zlib.deflateSync(res.css)),
    ]);
  });
}
