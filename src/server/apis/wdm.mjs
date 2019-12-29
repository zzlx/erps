/**
 * webpack development middleware
 *
 */

import path from 'path';
import webpack from 'webpack';
import MemoryFs from 'memory-fs';

import webpackConfig from '../../config.webpack.cjs';

export default () => {
  const config = webpackConfig();
  const compiler = webpack(config);
  const memFs = new MemoryFs();
  compiler.outputFileSystem = memFs;

  // compiler
  compiler.watch(config.watchOptions, callback);

  return async function webpackDevMiddleware(ctx, next) {
    if ('development' !== ctx.app.env) {
      return await next();
    }

    const root = config.output.path;
    const relativePath = path.relative('/', ctx.pathname);
    let realPath = path.resolve(root, relativePath);
    let url = null;

    if (realPath === root) {
      url = path.join(realPath, 'index.html');
    }

    if (memFs.existsSync(realPath)) {
      url = realPath;
    }

    if (null === url || url === root) {
      url = path.join(root, 'index.html');
      ctx.type = path.extname(url);
    } else {
      ctx.type = path.extname(realPath);
    } 

    if (!memFs.existsSync(url)) {
      return ctx.status = 404;
    }

    ctx.body = memFs.createReadStream(url);

  }
}

function callback (err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
  }

  if ('development' === process.env.NODE_ENV) {
    console.log(stats.toString({
      chunks: false,
      colors: true,
    }));
  }
}
