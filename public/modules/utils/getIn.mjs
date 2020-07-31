/**
 *
 * getIn
 *
 * get value from a deep nesting layer obj
 *
 * Usage:
 *
 * ```
 * const obj = {
 *  test: {
 *    test1: {
 *      test2: 'test3'
 *    }
 *  }
 * };
 *
 * const paths = [test, test1, test2];
 *
 * const value = getIn.apply(obj, paths);
 *
 * value === 'test3' // true
 *
 * ```
 *
 * @param {array} valuePath
 * @return {string|object|array} value
 * @api public
 */

export default function getIn() {
  const paths = Array.prototype.slice.call(arguments);
  let value = this;

  if (null == value) return null;
  if (null == paths) return value;

  for (let path of paths) {
    if (value[path]) {
      value = value[path];
      continue;
    } 

    value = null;
    break;
  }

  return value
} 
