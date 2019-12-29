/**
 * 日期对象工具函数库
 *
 *
 */

export default new Proxy(Date, {
	apply: function (target, thisArg, argumentsList) {
		return new target(...argumentsList); 
	},
	construct: function (target, argumentsList, newTarget) {
		return new target(...argumentsList); 
	},
	get: function (target, property, receiver) {
		if (property === 'print') {
			receiver.print = print;
		}
		if (property === 'toLocaleISOString') {
			receiver.toLocaleISOString = toLocaleISOString;
		}

		return Reflect.get(target, property, receiver);
	},
});

/**
 * 打印日期
 *
 * ####年#月#日 星期#
 */

function print() {
	const date = new Date();
	return `${date.getFullYear()}年${date.getMonth+1}月${date.getDate()}`;
}

/**
 * 获取星期日
 * weekday
 * @param {date} date
 * @return {string}
 */

function weekday(date) {
	const day = ['日', '一', '二', '三', '四', '五', '六'];
	return '星期' + day[date.getDay()];
}

function format () {
	// get variables
  const value = null == this ? arguments[0] : this._value;
	let fmt = null == this ? arguments[1] : arguments[0];

  const obj = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? o[k]
          : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
}

/**
 *
 * iso8601-utc:   YYYY-MM-DDTHH:mm:ss.sssZ
 * iso8601-local: YYYY-MM-DDTHH:mm:ss.sss+0800
 *
 * @return {string} locale iso string
 */

function toLocaleISOString () {
	const tzOffset = (new Date().getTimezoneOffset())/60;
	const timestamp = Date.now() - tzOffset * 3600000;
	const trail = `+0${Math.abs(tzOffset)}00`; // @todo: 需要优化
  return new Date(timestamp).toISOString().replace(/Z$/g, trail)
}

/**
 * 获取t+n日期
 */

function tPlusN () {
	const dateTime = null == this ? arguments[0] : '';
	let n = null == this ? arguments[1] : arguments[0];

	n = n ? n : 1;
  const date = new Date(datetime);
	const date_today = date.toLocaleString().replace(/\s.*/, '');
	if (Date.parse(date) === Date.parse(date_today)) {
		n = n - 1;
	}

	const timestamp = Date.parse(date);
	const t_plus_n = timestamp + ( n + 1) * 86400000;
	const reset = new Date(t_plus_n).toLocaleString().replace(/\s.*/, '');
	return new Date(reset); 
}
