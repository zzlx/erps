/**
 * *****************************************************************************
 *
 * CSV processor -- CSV处理函数
 *
 * 转换关联数组为csv字符串数组
 * Convert array object to csv string
 * @todo: 增加buffer\stream支持
 *
 * *****************************************************************************
 */

export default new Proxy({
  value: null,
  csv: null,
}, {
	apply: function (target, thisArg, argumentsList) {
    if (typeof(value) === 'string' && isCSV(value)) {
      target.csv = value;
      target.value = csvParser(value);
    }

    if (Array.isArray(value)) {
      target.value = value;
      target.csv = toCSV(value);
    }

    console.log(this);
    return this;
  },

  get: function (target, property, receiver) {
    if (property === 'isCSV') {
      return value => isCSV(value);
    }

    if (property === 'toString') {
      return  value => toCSV(value)
    }

    return Reflect.get(target, property, receiver);
  },
});

function toCSV (value) {

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

function csvParser(csv) {
  csv = String(csv);
  if ('string' !== typeof csv) throw new TypeError('Must be csv string.');

  const retval = [];
  const lines = csv.split(/\r\n|\n/);
  let i = 0, keys;

  const parser = (csv) => {
    const csvValueRegExp = new RegExp(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/, 'g');
    const result = [];
    let match;

    // 匹配值
    while((match = csvValueRegExp.exec(csv)) !== null) {
      if (undefined !== match[1]) { result.push(match[1].trim()); continue; }
      if (undefined !== match[2]) { result.push(match[2].trim()); continue; }
      if (undefined !== match[3]) { result.push(match[3].trim()); continue; }
      result.push(''); // 空值
    }

    return result.length ? result : null;

  }

  for (let line of lines) {
    const obj = {};
    const result = parser(line);
    if (!result) continue;
    if (i === 0 ) { keys = result; i++; continue; }

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      obj[key] = result[j];
    }

    retval.push(obj);
  }

  return retval;
}

function isCSV (value) {
  const csvValidRegExp = /^\s*(?:\'[^\'\\]*(?:\\[\S\s][^\'\\]*)*\'|\"[^\"\\]*(?:\\[\S\s][^\"\\]*)*\"|[^,\'\"\s\\]*(?:\s+[^,\'"\s\\]+)*)\s*(?:,\s*(?:\'[^\'\\]*(?:\\[\S\s][^\'\\]*)*\'|\"[^\"\\]*(?:\\[\S\s][^\"\\]*)*\"|[^,\'\"\s\\]*(?:\s+[^,\'\"\s\\]+)*)\s*)*$/;

  return typeof(value) === 'string' && csvValidRegExp.test(value);
}
