/**
 *
 * Similar to Array.prototype.reduce(), 
 * however the reducing callback may return a Promise, 
 * in which case reduction will continue after each promise resolves.
 *
 * If the callback does not return a Promise, 
 * then this function will also not return a Promise.
 *
 */

export default function promiseReduce(values, callback, initialValue) {
  return values.reduce(function (previous, value) {
    return previous && typeof previous.then === 'function' 
      ? previous.then((resolved) => callback(resolved, value)) 
      : callback(previous, value);
  }, initialValue);
}
