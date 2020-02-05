/**
 * webpack compiler
 *
 *
 * @file compiler.mjs
 */

import webpack from 'webpack';
import webpackConfig from './webpack.config.cjs';
import MemoryFs from 'memory-fs';

const config = webpackConfig();
const compiler = webpack(config);

// @todo: 内存存储
// 内存文件系统
//const memFs = new MemoryFs();
//compiler.outputFileSystem = memFs;

compiler.watch(config.watchOptions, callback);

/**
 *
 */

function callback (err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) console.error(err.details);

    return;
  }

  const info = stats.toJson();
  if (stats.hasErrors()) console.error(info.errors);
  if (stats.hasWarnings()) console.warn(info.warnings);

  console.log(stats.toString({ chunks: false, colors: true, }));
}
