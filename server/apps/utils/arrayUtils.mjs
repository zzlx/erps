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

export const arrayUtils = new Proxy(Array, {
  get: function (target, prop, receiver) {
    if (prop === 'sort') receiver.sort = sort;
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
