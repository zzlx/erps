#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 生成css文件
 *
 * [参考文档](../node_modules/node-sass/README.md)
 * [发行版本](https://github.com/sass/node-sass/releases/tag/v4.14.1)
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import sass from 'sass';
import settings from '../../src/settings.mjs';

const isDevel = process.env.NODE_ENV === 'development' ? true : false;
const scssEntryPoint = path.join(settings.paths.SRC, 'scss', 'styles.scss');
const cssFile = path.join(
  settings.paths.PUBLIC, 
  'assets', 
  'css', 
  path.basename(scssEntryPoint, '.scss') + '.css',
);
const cssFileDeflate = cssFile + '.deflate';
const cssFileBr = cssFile + '.br';
const cssFileGz = cssFile + '.gz';

sass.render({
  file: scssEntryPoint,
  outputStyle: isDevel ? 'expanded' : 'compressed',
}, function(err, result) { 
  if (err) console.error(err);
  // 保证目标文件的目录已经准备就绪
  fs.mkdirSync(path.dirname(cssFile), {recursive: true}); 

  const tasks = Promise.all([
    fs.promises.writeFile(cssFile, result.css),
    fs.promises.writeFile(cssFileGz, zlib.gzipSync(result.css)),
    fs.promises.writeFile(cssFileBr, zlib.brotliCompressSync(result.css)),
    fs.promises.writeFile(cssFileDeflate, zlib.deflateSync(result.css)),
  ].filter(Boolean));

});
