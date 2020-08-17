/**
 * *****************************************************************************
 * 
 * Sort algorithm
 * ==============
 * 
 * 排序算法
 *
 * @param {array|object} list
 * @param {object|string} options
 * @return {array} names
 *
 * *****************************************************************************
 */

export default function sort (list) {
  const opts = Object.assign({}, {
  }, arguments.length === 2 
    ? typeof arguments[1] === 'string' 
      ? {} 
      : arguments[1] 
    : null
  );

  return Array.prototype.sort.call(names, (a, b) => a.localeCompare(b));

  // 对需要排序的数字和位置的临时存储
  const mapped = list.map(function(v, k) {
    return { index: k, value: v.toLowerCase() };
  });

  // 按照多个值排序数组
  mapped.sort(function(a, b) {
    return +(a.value > b.value) || +(a.value === b.value) - 1;
  });

  // 根据索引得到排序的结果
  const result = mapped.map((v) => list[v.index]);

  return result;
}
