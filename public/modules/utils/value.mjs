/**
 * *****************************************************************************
 *
 * 判断value类型
 *
 * *****************************************************************************
 */

export default value => new Proxy({
  value: value,
}, {
  get: function (target, property, receiver) {
    const value = target.value;

    if (property === 'isEmailAddress') {
      const regExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
      return regExp.test(String(value));
    }

    if (property === 'isIDNumber') {
      const regExp = /^\d{15}|\d{18}$/;
      return regExp.test(String(value));
    }

    if (property === 'isInvalid') {
      return value === undefined || value !== value;
    }

    if (property === 'isInteger') {
      return typeof value === 'number' && 
        Number.isFinite(value) && 
        Math.floor(value) === value;
    }

    if (property === 'isJSON') {
      const regExp = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
      return regExp.test(String(value));
    }

    if (property === 'isNumber') {
      const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
      const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

      return typeof value === 'number' || 
        typeof value === 'string' && Number.isFinite(Number(value.replace(/[,?]/g, '')));
    }

    if (property === 'isNullish') {
      return value === null || value === undefined || value !== value;
    }

    if (property === 'isURL') {
      return /[a-zA-z]+:\/\/[^\s]*/.test(str);
    }

    if (property === 'isPromise') {
      return Boolean(value && typeof value.then === 'function');
    }

    if (property === 'isZhCN') {
      const regExp = /[\u4e00-\u9fa5]/;
      return regExp.test(String(value));
    }

    if (property === 'isPhoneNumber') {
      const regExp = /(?:^\d{3,4}-\d{7,8}$)|(?:^\d{10}$)/;
      return regExp.test(String(value));
    }

    if (property === 'isPlainObject') return isPlainObject(value);

    return Reflect.get(target, property, receiver);
  },
});

function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = Object.getPrototypeOf(obj)
  if (proto === null) return true

  let baseProto = proto
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto)
  }

  return proto === baseProto
}
