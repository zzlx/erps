/**
 *
 * Given an error, returns an AsyncIterable which will fail with that error.
 * Similar to Promise.reject(error)
 *
 *
 *
 *
 */

import { iterall } from '../../utils/iterall.mjs';

export function asyncIteratorReject(error) {
  let isComplete = false;

  return Object.defineProperty({
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
  }, iterall.$$asyncIterator, {
    value: function () { return this; }
  });
}
