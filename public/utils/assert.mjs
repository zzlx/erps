/**
 * *****************************************************************************
 *
 * 断言工具库
 *
 * *****************************************************************************
 */

export default new Proxy(assert, {
  apply: function(target, thisArg, argumentsList) {
    return target.apply(thisArg, argumentsList);
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

    if (property === 'is') return is;
    if (property === 'shallowEqual') return shallowEqual;
    if (property === 'valueEqual') return valueEqual;

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
  if (condition) return;
  const err = new Error(message || `Assertion failed.`);
  if (Error.captureStackTrace) Error.captureStackTrace(err, assert);
  throw err;
}

function isEmail (v) {
  return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(String(v));
}

function isIDNumber (v) {
  return /^\d{15}|\d{18}$/.test(String(v));
}

function isInvalid (v) {
  return v === undefined || v !== v;
}

function isInteger (v) {
  return typeof v === 'number' && Number.isFinite(v) && Math.floor(v) === v;
}

function isJSON (v) {
  return /^[\x20\x09\x0a\x0d]*(\[|\{)/.test(String(v));
}

function isNumber (v) {
  const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
  const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

  if ('number' === typeof v) return true;
  if ('string' === typeof v) return Number.isFinite(Number(v.replace(/[,?]/g, '')));
  return false;
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
  return /(?:^\d{3,4}-\d{7,8}$)|(?:^\d{10}$)/.test(String(v));
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

/**
 * *****************************************************************************
 *
 * Shallow equal 
 *
 * 比较两个对象是否相等
 * 无法对深层嵌套对象进行比较
 *
 * @param {obj|string|number} objA
 * @param {obj|string|number} objB
 * @return {boolean} true or false
 *
 * *****************************************************************************
 */

function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if ( typeof objA !== 'object' || objA === null ||
       typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  const hasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];

    if (!hasOwnProperty(key)) return false;

    const valueA = objA[key];
    const valueB = objB[key];

    // 比较值
    // @bug 无法比对嵌套对象
    if (!is(valueA, valueB)) return false;

    // 转换成字符比
    // @bug: 无法正确比较{a: 'a', b: 'b'} {b: 'b', a: 'a'}
    // if (JSON.stringify(valueA) !== JSON.stringify(valueB)) return false;
  }

  return true
}

function is (x, y) {
  // SameValue algorithm
  if (x === y) {
   // 处理为+0 != -0的情况
    return x !== 0 || 1 / x === 1 / y;
  } else {
  // 处理 NaN === NaN的情况
    return x !== x && y !== y;
  }
}

function valueEqual(a, b) {
	const valueOf = obj => obj.valueOf 
		? obj.valueOf() 
		: Object.prototype.valueOf.call(obj);

  // Test for strict equality first.
  if (a === b) return true;

  // Otherwise, if either of them == null they are not equal.
  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every(function(item, index) {
        return valueEqual(item, b[index]);
      })
    );
  }

  if (typeof a === 'object' || typeof b === 'object') {
    var aValue = valueOf(a);
    var bValue = valueOf(b);

    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

    return Object.keys(Object.assign({}, a, b)).every(function(key) {
      return valueEqual(a[key], b[key]);
    });
  }

  return false;
}
