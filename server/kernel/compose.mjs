/**
 * *****************************************************************************
 *
 * Compose `middleware` returning a fully valid middleware.
 *
 * @param {Array} middleware
 * @return {Function}
 *
 *
 * *****************************************************************************
 */

export function compose(middleware) {
  // test middlewares
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware must be an array!');
  }

  return function middlewareFn (context, next) {
    let index = -1;

    return dispatch(0);

    function dispatch (i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      index = i;
      const fn = i === middleware.length ? next : middleware[i];
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn.call(context, context, dispatch.bind(null, ++i)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

  }
}
