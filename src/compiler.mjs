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

// 内存文件系统
//const memFs = new MemoryFs();
//compiler.outputFileSystem = memFs;

compiler.watch(config.watchOptions, callback);

// 
process.on('message', (m, httpd) => {
  if (m === 'httpd') {
    console.log(httpd);
  }

  console.log('Webpack compiler got message:', m);
});

/**
 *
 */

function callback (err, stats) {
  // send
  //if (process.send) process.send({data: memFs.data});

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
