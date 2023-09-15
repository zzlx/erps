/**
 * *****************************************************************************
 *
 * Compose single-argument functions from right to left. 
 *
 * The rightmost function can take multiple arguments 
 * as it provides the signature for the resulting composite function.
 *
 * For example:
 * compose(f, g, h) is identical to doing (...args) => f(g(h(...args))).
 *
 * @param {array} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 *
 * *****************************************************************************
 */

export function compose(...functions) {
  for (const fn of functions) {
    if (typeof fn !== "function") {
      throw new TypeError(fn, " must be function for compose.");
    }
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
}
