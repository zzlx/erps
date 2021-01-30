/**
 * *****************************************************************************
 *
 * error中间件
 *
 * *****************************************************************************
 */

import logWriter from '../../logWriter.mjs';

export default function error (options = {}) {
  const opts = Object.assign({
  }, typeof options === 'string' ? { logFile: options } : options);

  return async function errorMiddleware (ctx, next) {
    try {
      attachEvents(ctx.stream);
      await next();
    } catch (err) {
      await logWriter(opts.logFile, err);
      return Promise.reject(err);
    }
  } 
}

function attachEvents (stream) {
  stream.on('frameError', (type, code, id) => {
    logWriter(`${type} frame with id ${id} error: {code}`);
  });
}
