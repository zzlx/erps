/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

export function isNativeError (err) {
  return Object.prototype.toString.call(err) === '[object Error]' || err instanceof Error;
}
