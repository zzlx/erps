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
import { assert } from '../server/utils.mjs';
import config from '../config/default.mjs';

const paths = config.paths;

sass.render({
  file: paths.scssEntryPoint,
  outputStyle: config.env === 'production' ? 'compressed': 'nested',
}, (err, result) => {
  if (err) console.err(err);;

  Promise.all([
    fs.promises.writeFile(paths.stylesCss, result.css),
    fs.promises.writeFile(paths.stylesCss + '.br', zlib.brotliCompressSync(result.css)),
  ]);
});
