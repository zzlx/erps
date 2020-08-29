/**
 * *****************************************************************************
 *
 * 生成styles.css资源
 *
 * *****************************************************************************
 */

import fs   from 'fs';
import path from 'path';
import util from 'util';
import zlib from 'zlib';

import { assert } from '../utils.mjs';
import config from '../config/default.mjs';

const paths = config.paths;

// 构建styles.css
import('node-sass').then(m => m.default).then(sass => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: paths.scssEntryPoint,
      outputStyle: config.env === 'production' ? 'compressed': 'nested',
    }, (err, result) => {
      if (err) reject(err);

      Promise.all([
        fs.promises.writeFile(paths.stylesCss, result.css),
        fs.promises.writeFile(paths.stylesCss + '.br', zlib.brotliCompressSync(result.css)),
      ]);

      resolve();
    });
  });
});
