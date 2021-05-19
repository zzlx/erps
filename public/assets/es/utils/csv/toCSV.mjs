/**
 * *****************************************************************************
 *
 * 转换关联数组为csv字符串数组
 * Convert array object to csv string
 * @todo: 增加buffer\stream支持
 *
 * *****************************************************************************
 */

import { assert } from '../assert.mjs';

export const toCSV = (value) => {
	assert(Array.isArray(value), '仅支持将数组对象转为CSV.');

	// 默认使用逗号分隔符
	const separator = ',';

	const it = makeIterator(value);
	const title = new Set();
	let csv = '';

	// step1: 规范化数组,遍历所以数组条目,获取完整的key值列表 
	while (it.hasNext()) {
		const item = it.next()
		for (let key of Object.keys(item)) {
			title.add(key); // 将key装入title
		}
	}

	// step2: 将title的值列表写入csv字符串
	csv += Array.from(title).join(separator) + '\n';

	// step3: 重置遍历器,重新遍历数组,使用title作为key值
	it.reset();

	while (it.hasNext()) {

		const item = it.next();
		const values = [];

		for (let key of title.values()) {
			if (null == item[key]) {
        values.push('');
      //} else if ('object' === typeof item[key] && item[key] instanceof Date) {
      //  values.push(date.toString(item[key]));
      //
      } else {
			  values.push(item[key]);
      }

		}

		csv += values.join(separator) + '\n';
	}
	
	// step4: 去掉尾部的换行符
	csv.charAt(csv.length -1).slice(0, -1);

	return csv;
}

function makeIterator (array) {
	let nextIndex = 0;
	return {
		reset: () => nextIndex = 0,
		hasNext: () => nextIndex < array.length,
		next: () => nextIndex < array.length ? array[nextIndex++] : null,
	}
}
