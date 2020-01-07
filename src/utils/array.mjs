/**
 * 数组类工具函数
 *
 * 功能列表: 
 *
 * toCSV: 输出CSV字符串
 * toHtmlTable: 输出html表格
 * toMarkdownTable: 输出markdown表格
 *
 */

import date from './date.mjs';

export default new Proxy(Array, {
  get: function (target, prop, receiver) {
    if (prop === 'sort') receiver.sort = sort;
    if (prop === 'toCSV') receiver.toCSV = toCSV;
    if (prop === 'keyMap') receiver.keyMap = keyMap;
    if (prop === 'groupBy') receiver.groupBy = groupBy;
    if (prop === 'sum') receiver.sum = sum;

    return Reflect.get(target, prop, receiver);
  }
});

function sort (types) {
  types.sort((a, b) => {
    const aType = a.type.toUpperCase();
    const bType = b.type.toUpperCase();
    if (aType < bType) {
      return -1;
    }

    if (aType > bType) {
      return 1;
    }

    return 0;
  });
}

function find (list, predicate) {
  if (Array.prototype.find) {
    return Array.prototype.find.call(list, predicate);
  }

  for (let i = 0; i < list.length; i++) {
    const value = list[i];
    if (predicate(value)) return value;
  }
}

/**
 * 对数据的字段求和
 *
 */

function sum(array, key) {
	let total = 0;

	if (null == key) {
		return array.length;
	}

	for (let item of array ) {
		if (item[key] && !Number.isNaN(Number(item[key]))) {
			total += Number(item[key]);
		}
	}

	return total;
}


/**
 * 对结果集合进行统计汇总
 *
 * @param {array} resArray 关联数组
 * @param {string} key
 *
 * @return
 */

function groupBy(array, key, selector = {}) {
  if (!Array.isArray(array)) throw new TypeError('resArray must be an array.');
  const al = array.length;
  const obj = {};
  const retval = [];

  // 第1次遍历数组
  for (let item of array) {
    const kv = item[key]; 
    obj[kv] = obj[kv] ? obj[kv] : {};

    for (let k of Object.keys(item)) {
      if (k === key) continue; // 略过key字段
      if (selector[k]) {
        const v = item[k];
        obj[kv][k] = obj[kv][k] ? obj[kv][k] : []; // 字段数组
        obj[kv][k].push(v);
      }
    }
  }

  for (let k of Object.keys(obj)) {
    const value = obj[k];
    for (let kv of Object.keys(value)) {
      obj[k][kv] = obj[k][kv].reduce((a, c) => Number(a) + Number(c) )
    }
    obj[k][key] = k;
    retval.push(obj[k]);
  }

  return retval;
}

/**
 *
 * @todo: 改造成全文查找
 *
 * Creates a keyed JS object from an array, 
 * given a function to produce the keys for each value in the array.
 *
 */

function keyMap (list, keyFn) {
  return list.reduce(function (map, item) {
    return map[keyFn(item)] = item, map;
  }, Object.create(null));
}

/**
 * 输出markdown格式表格
 */

function toMarkdownTable () {
}

/**
 * 转换关联数组为csv字符串数组
 * Convert array object to csv string
 * @todo: 增加buffer\stream支持
 */

function toCSV () {
	const value = this;

	if (!Array.isArray(value)) throw new TypeError('仅支持将数组对象转为CSV.');

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
      } else if ('object' === typeof item[key] && item[key] instanceof Date) {
        values.push(date.toString(item[key]));
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

/**
 *
 *
 */

function getMaxOne(map) {
	let maxKey = null;
	let maxValue = 0;

	for (let key of map.keys()) {
		const value = map.get(key);
		if (value > maxValue) {
			maxKey = key;
			maxValue = value;
		}
	}

	return maxKey;
}
