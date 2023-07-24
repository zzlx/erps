/**
 * *****************************************************************************
 *
 * 格式化日期字符串
 *
 * @param {object|string} date
 * @param {string} fmt
 * @return {string}
 *
 * *****************************************************************************
 */

export function formatDate () {
  const date = arguments.length === 2 ? new Date(arguments[0]) : new Date();
  let fmt = arguments.length === 2 ? arguments[1] : arguments[0];

  if (typeof fmt !== 'string') throw new Error('fmt must be string.');

  const o = {
    'y+': date.getFullYear(),
    'm+': date.getMonth() + 1,
    'd+': date.getDate(),
    'H+': date.getHours(),
    'M+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds() //毫秒
  };

  for (let k of Object.keys(o)) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        new RegExp("(" + k + ")"),
        RegExp.$1.length === 1 || /y+/.test(RegExp.$1)
          ? o[k]
          : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }

  return fmt;
}
