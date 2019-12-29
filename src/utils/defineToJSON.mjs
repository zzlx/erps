/**
 * The `defineToJSON()` defines toJSON() and inspect() prototype methods,
 * if no function provided they become aliases for toString().
 *
 *
 *
 *
 *
 */

import nodejsCustomInspectSymbol from './nodejsCustomInspectSymbol.mjs';

// eslint-disable-next-line flowtype/no-weak-types
export default function defineToJSON(classObject) {
  const fn = arguments.length > 1 && arguments[1] !== undefined 
    ? arguments[1] 
    : classObject.prototype.toString;

  classObject.prototype.toJSON = fn;
  classObject.prototype.inspect = fn;

  if (nodejsCustomInspectSymbol) {
    classObject.prototype[nodejsCustomInspectSymbol] = fn;
  }
}
