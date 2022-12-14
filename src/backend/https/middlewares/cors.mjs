/**
 * *****************************************************************************
 *
 * CORS middleware
 *
 * @param {Object} [options]
 *  - {String|Function(ctx)} origin `Access-Control-Allow-Origin`, default is request Origin header
 *  - {String|Array} allowMethods `Access-Control-Allow-Methods`, default is 'GET,HEAD,PUT,POST,DELETE,PATCH'
 *  - {String|Array} exposeHeaders `Access-Control-Expose-Headers`
 *  - {String|Array} allowHeaders `Access-Control-Allow-Headers`
 *  - {String|Number} maxAge `Access-Control-Max-Age` in seconds
 *  - {Boolean} credentials `Access-Control-Allow-Credentials`
 *  - {Boolean} keepHeadersOnError Add set headers to `err.header` if an error is thrown
 * @return {Function} cors middleware
 * @api public
 * *****************************************************************************
 */

export function cors (options) {

  options = options || {};
  options.allowMethods = options.allowMethods || 'GET,POST,HEAD,OPTIONS';
  options.credentials = options.credentials || true;
  options.origin = options.origin || '*';

  if (Array.isArray(options.exposeHeaders)) {
    options.exposeHeaders = options.exposeHeaders.join(',');
  }

  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(',');
  }

  if (Array.isArray(options.allowHeaders)) {
    options.allowHeaders = options.allowHeaders.join(',');
  }

  if (options.maxAge) {
    options.maxAge = String(options.maxAge);
  }

  options.credentials = !!options.credentials;

  options.keepHeadersOnError = options.keepHeadersOnError === undefined || !!options.keepHeadersOnError;

  return function corsMiddleware(ctx, next) {

    // get origin
    const requestOrigin = ctx.get('origin');

    ctx.set('origin', '*');

    if (!requestOrigin) { return next(); }

    let origin = options.origin || requestOrigin;

    if (ctx.method !== 'OPTIONS') {
      // 
      ctx.set('Access-Control-Allow-Origin', origin);

      if (options.credentials === true) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      if (options.exposeHeaders) {
        ctx.set('Access-Control-Expose-Headers', options.exposeHeaders);
      }

      if (!options.keepHeadersOnError) {
        return next();
      }

      return next();

    } else {
      if (!ctx.get('Access-Control-Request-Method')) return next();

      ctx.set('Access-Control-Allow-Origin', origin);

      // ?????????preflight????????????????????????????????????
      if (options.maxAge) {
        ctx.set('Access-Control-Max-Age', options.maxAge);
      }

      // ????????????????????????credentials?????????true??????????????????????????????response?????????
      if (options.credentials === true) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
      }

      // ????????????????????????????????????????????????????????????????????? HTTP ??????
      if (options.allowMethods) {
        ctx.set('Access-Control-Allow-Methods', options.allowMethods);
      }

      let allowHeaders = options.allowHeaders;

      if (!allowHeaders) {
        allowHeaders = ctx.get('Access-Control-Request-Headers');
      }

      // ?????????????????????????????????????????????????????????????????????????????????
      if (allowHeaders) {
        ctx.set('Access-Control-Allow-Headers', allowHeaders);
      }

      ctx.status = 204; // no content
    }
  }
}
