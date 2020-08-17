/**
 * *****************************************************************************
 *
 * 打印调试信息
 *
 * *****************************************************************************
 */

export default function debug () {
  if (!(env && env === 'development')) return;

  if (console && console.trace) {
    console.trace(...arguments);
  } else {
    console.log(...arguments);
  }
}
