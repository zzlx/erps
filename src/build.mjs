/**
 * *****************************************************************************
 *
 * Build ui application
 *
 *
 * @file build.mjs
 * *****************************************************************************
 */

import path from 'path';
import webpack from 'webpack';
//import MemoryFs from 'memory-fs';
import webpackConfig from './webpack.config.cjs';

const compiler = webpack(webpackConfig());
//const memFs = new MemoryFs();
//compiler.outputFileSystem = memFs;

compiler.run(callback);

function callback (err, stats) {
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

  console.log(stats.toString({ chunks: false, colors: true, }));

  if ('development' === process.env.NODE_ENV) {
  }
}
