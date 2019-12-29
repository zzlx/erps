/**
 *
 * Given an error, returns an AsyncIterable which will fail with that error.
 * Similar to Promise.reject(error)
 *
 *
 *
 *
 */

import _defineProperty from '../../utils/defineProperty';
import { $$asyncIterator } from '../../utils/iterall.mjs';

export default function asyncIteratorReject(error) {
  let isComplete = false;

  return _defineProperty({
    next: function next() {
      const result = isComplete 
        ? Promise.resolve({ value: undefined, done: true }) 
        : Promise.reject(error);
      isComplete = true;
      return result;
    },
    return: function _return() {
      isComplete = true;

      return Promise.resolve({
        value: undefined,
        done: true
      });
    },
    throw: function _throw() {
      isComplete = true;
      return Promise.reject(error);
    }
  }, $$asyncIterator, function () {
    return this;
  });
}
