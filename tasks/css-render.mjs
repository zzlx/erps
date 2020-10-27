#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 生成css文件
 *
 * [参考文档](../node_modules/node-sass/README.md)
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import settings from '../server/config/settings.mjs';

const isDevel = process.env.NODE_ENV === 'development' ? true : false;
const paths = settings.paths; // 获取目录配置
const scssEntryPoint = path.join(paths.SRC, 'scss', 'styles.scss');
const cssFile = path.join(
  paths.WWW_PATH, 
  'assets', 
  'css', 
  path.basename(scssEntryPoint, '.scss') + '.css',
);
const cssFileDeflate = cssFile + '.deflate';
const cssFileBr = cssFile + '.br';

// node-sass module
import('node-sass').then(m => new Promise((resolve, reject) => {
  const sass = m.default ? m.default : m;

  sass.render({
    file: scssEntryPoint,
    outputStyle: isDevel ? 'nested' : 'compressed',
  }, async (err, result) => {
    if (err) reject(err);

    // 保证目标文件的目录已经准备就绪
    fs.mkdirSync(path.dirname(cssFile), {recursive: true}); 

    const tasks = Promise.all([
      fs.promises.writeFile(cssFile, result.css),
      fs.promises.writeFile(cssFileDeflate, zlib.deflateSync(result.css)),
      fs.promises.writeFile(cssFileBr, zlib.brotliCompressSync(result.css)),
    ].filter(Boolean));

    resolve(tasks);
  });
}));
