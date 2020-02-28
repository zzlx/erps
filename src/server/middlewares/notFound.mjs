/**
 *
 *
 *
 */

export default function () {
  return function notFoundMiddleware (ctx, next) {
    ctx.throw(404, '页面未定义');
  }
}
