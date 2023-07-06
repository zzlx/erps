/**
 *
 * The `defineToJSON()` defines toJSON() and inspect() prototype methods,
 * if no function provided they become aliases for toString().
 *
 */

// eslint-disable-next-line flowtype/no-weak-types
export function defineToJSON(classObject) {
  const fn = arguments.length > 1 && arguments[1] !== undefined 
    ? arguments[1] 
    : classObject.prototype.toString;

  if (classObject.prototype.toJSON == null) classObject.prototype.toJSON = fn;
  if (classObject.prototype.inspect == null) classObject.prototype.inspect = fn;

  const nodejsInspect = typeof Symbol === 'function' 
    ? Symbol.for('nodejs.util.inspect.custom') 
    : undefined;

  if (nodejsInspect && classObject.prototype[nodejsInspect] == null) {
    classObject.prototype[nodejsInspect] = fn;
  }
}
