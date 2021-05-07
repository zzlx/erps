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
    console.log('触发一次');

    if (timeout && timeout['_idleTimeout'] > 0) {
      console.log('取消一次');
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => { 
      console.log('执行一次');
      taskFn.apply(this, arguments); 
    }, nMs);

  }
}
