/**
 * *****************************************************************************
 *
 * Debouncing algorithm
 *
 * 防抖算法: 
 * 在一定时间内，多次触发同一个事件，只执行最后一次操作。
 * 高频触发结束nMs后执行一次工作任务
 *
 * *****************************************************************************
 */

export function debounceAlgorithm (fn, ms = 100) {
  let timer;

  return function () {
    if (timer && timer['_idleTimeout'] > 0) {
      clearTimeout(timer); // 清理掉之前的任务fn
    }

    timer = setTimeout(() => {
      fn.apply(null, arguments);
    }, ms);
  }
}
