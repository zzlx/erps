/**
 * *****************************************************************************
 *
 * error中间件
 *
 * *****************************************************************************
 */

import path from 'path';
import logWriter from '../logWriter.mjs';

export default function error (options = {}) {
  const opts = Object.assign({}, {
    path: process.cwd(),
  }, typeof options === 'string' ? {path: options} : options);

  const logFile = path.join(opts.path, 'error.log');

  return async function errorMiddleware (ctx, next) {
    try {
      attachEvents(ctx.stream);

      await next();
    } catch (err) {
      logWriter(logFile, err);
      return Promise.reject(err);
    }
  } 
}

function attachEvents (stream) {
  stream.on('frameError', (type, code, id) => {
    console.log('%s frame with id %s error: %s', type, id, code);
  });
}
