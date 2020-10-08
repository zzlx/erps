#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 生成css文件
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import settings from '../server/config/settings.mjs';

const paths = settings.paths;
const scssEntryPoint = path.join(paths.PUBLIC, 'styles', 'scss', 'main.scss');
const cssFile = path.join(paths.PUBLIC, 'styles', 'main.css');

// node-sass module
import('node-sass').then(m => new Promise((resolve, reject) => {
  const sass = m.default ? m.default : m;
  sass.render({
    file: scssEntryPoint,
    outputStyle: settings.env === 'production' ? 'compressed': 'nested',
  }, (err, result) => {
    if (err) reject(err);

    const tasks = Promise.all([
      fs.promises.writeFile(cssFile, result.css),
      fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(result.css)),
    ]);

    resolve(tasks);
  });
})).catch(err => console.error(err));
