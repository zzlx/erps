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
 * *****************************************************************************
 */

export function isShallowEqual(objA, objB) {
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
