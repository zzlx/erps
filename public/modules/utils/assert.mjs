/**
 * *****************************************************************************
 *
 * assert
 *
 * @param {} value
 * @param {string} message
 * @return
 * *****************************************************************************
 */

export default function assert (condition, message) {
  if (!condition) {
    const err = new Error(message || `Assertion failed.`);
    if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
    throw err;
  }
}
