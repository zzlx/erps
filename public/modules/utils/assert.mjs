/**
 *
 *
 *
 */

export default function assert (val, msg) {
  if (!val) {
    const err = new Error(msg || 'Assertion failed');

    if (Error.captureStackTrace) Error.captureStackTrace(err, assert);

    throw err;
  }
}
