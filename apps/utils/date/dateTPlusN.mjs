/**
 * *****************************************************************************
 *
 * 计算t+n日期
 *
 * @param: {object} date
 * @param: {bumber} n
 *
 * *****************************************************************************
 */

const MONTHS = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'
];

export function dateTPlusN (date, n) {

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
