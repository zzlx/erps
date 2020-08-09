/**
 * 
 * Sort algorithm
 * 排序算法
 *
 * @param {array} names
 * @return {array} names
 *
 */

export default function sort (names) {
  return Array.prototype.sort.call(names, (a, b) => a.localeCompare(b));
}
