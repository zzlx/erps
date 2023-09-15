/**
 * *****************************************************************************
 *
 * Composes single-argument functions from right to left. 
 *
 * The rightmost function can take multiple arguments 
 * as it provides the signature for the resulting composite function.
 *
 * For example:
 * compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
 *
 * @param {array} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions from right to left. 
 *
 * *****************************************************************************
 */

export function compose() {
  const functions = Array.prototype.slice.call(arguments);

  for (const fn of functions) {
    if ("function" !== typeof fn) {
      throw new Error("Must be compose of functions.");
    }
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}
