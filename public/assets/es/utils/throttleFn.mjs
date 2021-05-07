/**
 * *****************************************************************************
 *
 * Throttle function
 *
 * 节流算法: 高频时间触发,但n毫秒内只会执行一次,所以节流会稀释函数的执行频率。
 *
 * * n秒内只执行一次
 *
 *
 *
 * *****************************************************************************
 */

export const throttleFn = (fn, nMs) => {
  let flag = true;

  return function () {
    if (flag === false) return;
    flag = false;

    setTimeout(() => {
      fn.apply(this, arguments);
      flag = true;
    }, nMs);
  }
}

