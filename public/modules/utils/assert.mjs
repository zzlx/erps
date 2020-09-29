/**
 * *****************************************************************************
 *
 * asserts
 *
 * *****************************************************************************
 */

export default new Proxy(() => {}, {
  apply: function(target, thisArg, argumentsList) {
    return assert.apply(thisArg, argumentsList);
  },
  get: function (target, property, receiver) {
    if (/plainObject/i.test(property)) return isPlainObject;
    if (/email/i.test(property)) return isEmail;
    if (/invalid/i.test(property)) return isInvalid;
    if (/int/i.test(property)) return isInteger;
    if (/id/i.test(property)) return isIDNumber;
    if (/json/i.test(property)) return isJSON;
    if (/number/i.test(property)) return isNumber;
    if (/null/i.test(property)) return isNullish;
    if (/phone/i.test(property)) return isPhone;
    if (/promise/i.test(property)) return isPromise;
    if (/url/i.test(property)) return isUrl;
    if (/[zh|cn]/i.test(property)) return isZhCN;

    return Reflect.get(target, property, receiver);
  },
});

/**
 * *****************************************************************************
 *
 * assert
 *
 * @param {} value
 * @param {string} message
 * @return
 * *****************************************************************************
 */

function assert (condition, message) {
  if (!condition) {
    const err = new Error(message || `Assertion failed.`);
    if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
    throw err;
  }
}

function isEmail (v) {
  const regExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  return regExp.test(String(v));
}

function isIDNumber (v) {
  return /^\d{15}|\d{18}$/.test(String(v));
}

function isInvalid (v) {
  return v === undefined || v !== v;
}

function isInteger (v) {
  return typeof v === 'number' && 
    Number.isFinite(v) && 
    Math.floor(v) === v;
}

function isJSON (v) {
  return /^[\x20\x09\x0a\x0d]*(\[|\{)/.test(String(v));
}

function isNumber (v) {
  const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
  const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

  return typeof v === 'number' || 
    typeof v === 'string' && 
    Number.isFinite(Number(v.replace(/[,?]/g, '')));
}

function isNullish (v) {
  return v === null || v === undefined || v !== v;
}

function isUrl (v) {
  return /[a-zA-z]+:\/\/[^\s]*/.test(str);
}

function isPromise (v) {
  return Boolean(v && typeof v.then === 'function');
}

function isZhCN (v) {
  return /[\u4e00-\u9fa5]/.test(String(v));
}

function isPhone (v) {
  const regExp = /(?:^\d{3,4}-\d{7,8}$)|(?:^\d{10}$)/;
  return regExp.test(String(v));
}

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
