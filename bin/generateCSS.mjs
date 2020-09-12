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
import { assert } from '../src/utils.mjs';
import config from '../src/config/default.mjs';

const paths = config.paths;

sass.render({
  file: paths.scssEntryPoint,
  outputStyle: config.env === 'production' ? 'compressed': 'nested',
}, (err, result) => {
  if (err) console.err(err);;

  Promise.all([
    fs.promises.writeFile(paths.cssFile, result.css),
    fs.promises.writeFile(paths.cssFile + '.br', zlib.brotliCompressSync(result.css)),
  ]);
});
