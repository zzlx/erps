/**
 * *****************************************************************************
 *
 * assert断言
 *
 * *****************************************************************************
 */

export default function assert (value, msg) {
  if (!value) {
    const err = new Error(msg || `Assertion failed.`);
    if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
    throw err;
  }
}
