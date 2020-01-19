/**
 *
 *
 *
 */

export default function () {
  return function notFoundMiddleware (ctx, next) {
    ctx.body = '404:not found';
  }
}
