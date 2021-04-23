/**
 * *****************************************************************************
 *
 * 断言
 *
 * @param {} value
 * @param {string} message
 *
 * *****************************************************************************
 */

export function assert (condition, message) {
  if (condition) return;
  const err = new Error(message || `Assertion failed.`);
  if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
  throw err;
}
