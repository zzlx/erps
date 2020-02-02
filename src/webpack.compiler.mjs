/**
 * webpack compiler
 * 
 * @file webpack.compiler.mjs
 */

import path from 'path';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';
import webpackConfig from './webpack.config.cjs';

const config = webpackConfig();
const compiler = webpack(config);

if (process.env.BUILD) {
  compiler.run(callback);
} else {
  const memFs = new MemoryFs();
  compiler.outputFileSystem = memFs;
  compiler.watch(config.watchOptions, callback);
}

function callback (err, stats) {
  // Error handler
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) console.error(info.errors);
  if (stats.hasWarnings()) console.warn(info.warnings);

  console.log(stats.toString({chunks: false, colors: true}));
  //console.log(stats.toJson({ assets: false, hash: true }));
}
