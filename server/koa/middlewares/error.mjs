/**
 * *****************************************************************************
 *
 * error中间件
 *
 * *****************************************************************************
 */

import path from 'path';
import logWriter from '../../utils/logWriter.mjs';

export default function error (options = {}) {
  const opts = Object.assign({}, {
    path: process.cwd(),
  }, typeof options === 'string' ? {path: options} : options);

  return async function errorMiddleware (ctx, next) {
    try {
      await next();
    } catch (err) {
      logWriter(path.join(opts.path, 'error.log'), err);
      return Promise.reject(err);
    }
  } 
}
