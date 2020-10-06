/**
 * *****************************************************************************
 *
 * stream 中间件
 * 
 * *****************************************************************************
 */

import util from 'util';
const debug = util.debuglog('debug:stream-middleware');

export default function stream () {
  return async function streamMiddleware (ctx, next) {
    const stream = ctx.stream;
    debug('stream');

    // 注册error事件处理器
    stream.on('error', error => {
      debug('Stream error: ', error);
    });

    stream.on('close', () => {
      debug('Stream is closed.');
    });

    stream.on('aborted', () => {
      debug('Stream is aborted.');
      ctx.state.aborted = true;
    });

    stream.on('trailers', (headers, flags) => {
      debug(headers);
    });

    await next();
  } 
}
