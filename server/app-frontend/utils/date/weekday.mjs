/**
 * 获取星期日
 *
 * weekday
 * @param {date} date
 * @return {string}
 */

export function weekday (date) {
  const d = date ? new Date(date) : new Date(); 

	const day = ['日', '一', '二', '三', '四', '五', '六'];
	return '星期' + day[d.getDay()];
}
