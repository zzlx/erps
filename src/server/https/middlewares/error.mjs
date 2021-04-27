/**
 * *****************************************************************************
 *
 * error中间件
 *
 * *****************************************************************************
 */

import path from 'path';

export default function error (options = {}) {
  const opts = Object.assign({

  }, typeof options === 'string' ? { path: options } : options);

  const logFile = path.join(opts.path, 'error.log');

  return async function errorMiddleware (ctx, next) {
    try {
      //attachEvents(ctx.stream);
      await next();
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  } 
}

function attachEvents (stream) {
  stream.on('frameError', (type, code, id) => {
    logWriter(`${type} frame with id ${id} error: {code}`);
  });
}
