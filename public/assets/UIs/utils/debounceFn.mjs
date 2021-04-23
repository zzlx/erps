/**
 * *****************************************************************************
 *
 * debounce 防抖
 * 触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。
 *
 * *****************************************************************************
 */

export const debounceFn = (time, fn) => {
  let timeout = null;

  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
}
