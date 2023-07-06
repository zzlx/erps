/**
 *
 * Memoizes the provided three-argument function.
 *
 */

export function memoize3(fn) {
  let cache0 = null;

  return function memoized(a1, a2, a3) {
    if (!cache0) {
      cache0 = new WeakMap();
    }

    let cache1 = cache0.get(a1);
    let cache2 = null;

    if (cache1) {
      cache2 = cache1.get(a2);

      if (cache2) {
        const cachedValue = cache2.get(a3);
        if (cachedValue !== undefined) return cachedValue;
      }
    } else {
      cache1 = new WeakMap();
      cache0.set(a1, cache1);
    }

    if (!cache2) {
      cache2 = new WeakMap();
      cache1.set(a2, cache2);
    }

    const newValue = fn.apply(this, arguments);
    cache2.set(a3, newValue);
    return newValue;
  }
}
