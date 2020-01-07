/**
 * date 日期对象工具函数库
 *
 * @return proxy
 * @api: public
 */

export default new Proxy(Date, {
  /**
   * @param: {} target 目标对象() 函数
   * @param: {} thisArg 被调用时的上下文对象
   * @param: {} argumentsList 被调用时的参数数组
   * @return 可以返回任何值
   *
   */

  apply: function (target, thisArg, argumentsList) {
    return new target(...argumentsList);
  },

  /**
   *
   * @param: {} newTarget 最初被调用的构造函数
   */

  construct: function (target, argumentsList, newTarget) {
    newTarget._date = this.apply(target, null, argumentsList); 
    return newTarget; 
  },

  get: function (target, property, receiver) {
    if (property === 'print') receiver.print = print;
    if (property === 'format') receiver.format = format;
    if (property === 'toString') receiver.toString = toString;
    if (property === 'toDateString') receiver.toDateString = toDateString;
    if (property === 'toLocaleISOString') receiver.toLocaleISOString = toLocaleISOString;

    return Reflect.get(target, property, receiver);
  },
});

/**
 *
 *
 */

function toDateString(date) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date();

	return toLocaleISOString(d).slice(0,10);
}


/**
 *
 *
 */

function toString(date) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date(); 

	return toLocaleISOString(d).slice(0,19).replace('T', ' ');
}

/**
 * 打印日期
 *
 * ####年#月#日 星期#
 */

function print(date) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date(); 

	return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
}


/**
 * 获取星期日
 *
 * weekday
 * @param {date} date
 * @return {string}
 */

function weekday(date) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date(); 

	const day = ['日', '一', '二', '三', '四', '五', '六'];
	return '星期' + day[d.getDay()];
}

/**
 * 格式化日期字符串
 *
 * weekday
 * @param {date} date
 * @return {string}
 */

function format (date, fmt) {
  if (fmt == null) {
    fmt = date;
    date = null;
  }

  const d = date 
    ? new Date(date) 
    : this && this.date 
      ? this.date 
      : new Date(); 

  const o = {
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

function toLocaleISOString (date) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date(); 

	const tzOffset = (d.getTimezoneOffset())/60;
	const timestamp = d.valueOf() - tzOffset * 3600000;
	const trail = `+0${Math.abs(tzOffset)}00`; // @todo: 需要优化
  return new Date(timestamp).toISOString().replace(/Z$/g, trail)
}

/**
 * 计算t+n
 *
 * @param: {} date
 *
 */

function tPlusN (date, n) {
  const d = date ? new Date(date) : this && this._date ? this._date : new Date(); 

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
