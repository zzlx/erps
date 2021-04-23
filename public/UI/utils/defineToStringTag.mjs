/**
 * The `defineToStringTag()` function checks first to see if the runtime
 * supports the `Symbol` class and then if the `Symbol.toStringTag` constant
 * is defined as a `Symbol` instance. If both conditions are met, the
 * Symbol.toStringTag property is defined as a getter that returns the
 * supplied class constructor's name.
 *
 * @method defineToStringTag
 *
 * @param {Class<any>} classObject a class such as Object, String, Number but
 * typically one of your own creation through the class keyword; `class A {}`,
 * for example.
 */

export function defineToStringTag(classObject) {
  if (classObject.prototype.toString == null) {
    Object.defineProperty(classObject.prototype, 'toString', {
      get: getName
    });
  }

  if (typeof Symbol === 'function' && Symbol.toStringTag) {
    if (classObject.prototype[Symbol.toStringTag] != null) return;
    Object.defineProperty(classObject.prototype, Symbol.toStringTag, {
      get: getName
    });
  }
}

function getName () {
  return this.constructor.name;
}
