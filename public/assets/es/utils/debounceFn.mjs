/**
 * *****************************************************************************
 *
 * Debounce algorithm
 *
 * 防抖算法: 高频触发结束后nMs执行一次工作任务
 *
 * *****************************************************************************
 */

export const debounceFn = (taskFn, nMs) => {
  let timeout = null;

  return function () {
    if (timeout && timeout['_idleTimeout'] > 0) clearTimeout(timeout);

    timeout = setTimeout(() => { 
      taskFn.apply(this, arguments); 
    }, nMs);

  }
}
