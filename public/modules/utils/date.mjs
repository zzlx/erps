/**
 * *****************************************************************************
 *
 * Date and time
 *
 * 最新标准:
 * [ISO 8601-1:2019](https://www.iso.org/obp/ui/#iso:std:iso:8601:-1:ed-1:v1:en)
 *
 * *****************************************************************************
 */

import assert from './assert.mjs';

export default new Proxy(Date, {
	apply: function (target, thisArg, argumentsList) {
    return target(...argumentsList);
	},

	construct: function (target, argumentsList, newTarget) {
    return new target(...argumentsList);
	},

	get: function (target, property, receiver) {

    if (property === 'format') return format;
    if (property === 'weekday') return weekday;
    if (property === 'toISOString') return toISOString;
    if (property === 'tPlusN') return tPlusN;
    if (property === 'getFormattedDate') return getFormattedDate;


		return Reflect.get(target, property, receiver);
  }
});


/*
const months = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
];
*/
const MONTHS = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

/**
 * 格式化日期字符串
 *
 * @param {object|string} date
 * @param {string} fmt
 * @return {string}
 *
 */

function format () {
  const date = arguments.length === 2 ? new Date(arguments[0]) : new Date();
  let fmt = arguments.length === 2 ? arguments[1] : arguments[0];

  assert(typeof fmt === 'string', 'fmt must be a string.')

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

/**
 * 获取星期日
 *
 * weekday
 * @param {date} date
 * @return {string}
 */

function weekday (date) {
  const d = date ? new Date(date) : new Date(); 

	const day = ['日', '一', '二', '三', '四', '五', '六'];
	return '星期' + day[d.getDay()];
}

/**
 *
 * iso8601-utc:   YYYY-MM-DDTHH:mm:ss.sssZ
 * iso8601-local: YYYY-MM-DDTHH:mm:ss.sss+0800
 *
 * @return {string} locale iso string
 */

function toISOString (date) {
  const d = date ? new Date(date) : new Date(); 
	const tzOffset = (d.getTimezoneOffset())/60;
	const timestamp = d.valueOf() - tzOffset * 3600000;
	const trail = `+0${Math.abs(tzOffset)}00`; // @todo: 需要优化
  return new Date(timestamp).toISOString().replace(/Z$/g, trail)
}

/**
 * 计算t+n日期
 *
 * @param: {object} date
 * @param: {bumber} n
 *
 */

function tPlusN (date, n) {
  const d = date ? new Date(date) : new Date(); 

	n = n ? n : 1;
	const date_today = d.toLocaleString().replace(/\s.*/, '');
	if (Date.parse(d) === Date.parse(date_today)) {
		n = n - 1;
	}

	const timestamp = Date.parse(d);
	const t_plus_n = timestamp + ( n + 1) * 86400000;
	const reset = new Date(t_plus_n).toLocaleString().replace(/\s.*/, '');
	return new Date(reset); 
}

function getFormattedDate (date) {
  const d = date ? new Date(date) : new Date(); 
  return d.getDate() + "-" + MONTHS[d.getMonth()] + "-" + d.getFullYear();
}
