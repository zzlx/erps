/**
 *
 * Given an AsyncIterable and a callback function, 
 * return an AsyncIterator which produces values mapped via calling the callback.
 *
 *
 *
 *
 */

import { iterall } from '../../utils/iterall.mjs';

export function mapAsyncIterator(iterable, callback, rejectCallback) {
  var iterator = iterall.getAsyncIterator(iterable);
  var $return;
  var abruptClose; 

  // $FlowFixMe(>=0.68.0)
  if (typeof iterator.return === 'function') {
    $return = iterator.return;

    abruptClose = function abruptClose(error) {
      var rethrow = function rethrow() {
        return Promise.reject(error);
      };

      return $return.call(iterator).then(rethrow, rethrow);
    };
  }

  function mapResult(result) {
    return result.done ? result : asyncMapValue(result.value, callback).then(iteratorResult, abruptClose);
  }

  var mapReject;

  if (rejectCallback) {
    // Capture rejectCallback to ensure it cannot be null.
    var reject = rejectCallback;

    mapReject = function mapReject(error) {
      return asyncMapValue(error, reject).then(iteratorResult, abruptClose);
    };
  }
  /* TODO: Flow doesn't support symbols as keys:
     https://github.com/facebook/flow/issues/3258 */


  return Object.defineProperty({
    next: function next() {
      return iterator.next().then(mapResult, mapReject);
    },
    return: function _return() {
      return $return ? $return.call(iterator).then(mapResult, mapReject) : Promise.resolve({
        value: undefined,
        done: true
      });
    },
    throw: function _throw(error) {
      // $FlowFixMe(>=0.68.0)
      if (typeof iterator.throw === 'function') {
        return iterator.throw(error).then(mapResult, mapReject);
      }

      return Promise.reject(error).catch(abruptClose);
    }
  }, iterall.$$asyncIterator, { 
    value: function () { return this; }
  });
}

function asyncMapValue(value, callback) {
  return new Promise(function (resolve) {
    return resolve(callback(value));
  });
}

function iteratorResult(value) {
  return {
    value: value,
    done: false
  };
}