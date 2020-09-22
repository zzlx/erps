#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * Generate css file
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import zlib from 'zlib';
import sass from 'node-sass'; // node-sass module
import { assert } from '../src/utils/index.mjs';
import config from '../src/config/settings.mjs';
const paths = config.paths;
const scssEntryPoint = path.join(paths.PUBLIC, 'styles', 'scss', 'main.scss');

sass.render({
  file: scssEntryPoint,
  outputStyle: config.env === 'production' ? 'compressed': 'nested',
}, (err, result) => {
  if (err) console.err(err);;

  const cssFile = path.join(paths.PUBLIC, 'styles', 'main.css');

  Promise.all([
    fs.promises.writeFile(cssFile, result.css),
    fs.promises.writeFile(cssFile + '.br', zlib.brotliCompressSync(result.css)),
  ]);
});
