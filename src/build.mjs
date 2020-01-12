/**
 * build
 * 构建并打包前端应用程序
 */

// 第三方模块
import webpack from 'webpack'; // webpack模块
import webpackConfig from './webpack.config.mjs';

export default function build (config) { 

  // 
  const compiler = webpack(config());

  compiler.run(handler);
}

function handler (err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
  }

  console.log(stats.toString({
    chunks: false,
    colors: true,
  }));
}
