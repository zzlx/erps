/**
 * *****************************************************************************
 *
 * Throttling algorithm
 *
 * 节流算法: 
 * 在一定时间内，多次触发同一个事件，只执行第一次操作
 * 高频触发时,nMs内只会执行一次
 *
 * *****************************************************************************
 */

export function throttleAlgorithm (fn, ms = 100) {
  let flag = true;

  return function () {
    if (flag === false) return;

    flag = false; // 重置状态

    setTimeout(() => {
      fn.apply(null, arguments);
      flag = true;
    }, ms);
  }
}
