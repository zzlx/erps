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

export default function assert (value, message) {
  if (!value) {
    const err = new Error(message || `Assertion failed.`);
    if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
    throw err;
  }
}
