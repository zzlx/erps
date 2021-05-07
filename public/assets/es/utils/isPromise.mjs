/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function isPromise (v) {
  // return v instanceof Promise;
  return v && typeof v === 'object' && typeof v.then === 'function';
}
