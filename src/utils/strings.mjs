/**
 * 字符对象扩展
 */

export default {
  csvToJSON,
  toCamelCase,
}

function toCamelCase(value) {
  return String(value)
    .toLowerCase()
    .replace(/(\b|-|_)\w/g, m => m.toUpperCase())
    .replace(/_|-|\s+|\W/,'');
}

function isURL (str) {
	return /[a-zA-z]+:\/\/[^\s]*/.test(str);
}

function isCSV () {
	const value = arguments.length ? this.data : arguments[0];
	// valid csv
	const csvValidRegExp = /^\s*(?:\'[^\'\\]*(?:\\[\S\s][^\'\\]*)*\'|\"[^\"\\]*(?:\\[\S\s][^\"\\]*)*\"|[^,\'\"\s\\]*(?:\s+[^,\'"\s\\]+)*)\s*(?:,\s*(?:\'[^\'\\]*(?:\\[\S\s][^\'\\]*)*\'|\"[^\"\\]*(?:\\[\S\s][^\"\\]*)*\"|[^,\'\"\s\\]*(?:\s+[^,\'\"\s\\]+)*)\s*)*$/;
	if ('string' === typeof value) {
		return csvValidRegExp.test(value); 
	}
}

function isJsonString () {
	const value = arguments.length === 0 ? this.data : arguments[0];
	const jsonValidRegExp = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
	return jsonValidRegExp.test(value);
}


function isNumber () {
	const value = arguments.length === 0 ? this.data : arguments[0];

	const decimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
	const thousandsFormatRegExp = /\B(?=(\d{3})+(?!\d))/g;

	return typeof value === 'number' || 
		typeof value === 'string' && Number.isFinite(Number(value.replace(/[,?]/g, '')));
}


function isZhCN(value) {
	const zhCNRegExp = /[\u4e00-\u9fa5]/;
  return zhCNRegExp.test(String(value));
}

function isIDNumber(value) {
	const idNumberRegExp = /^\d{15}|\d{18}$/;
  return idNumberRegExp.test(String(value));
}

function isEmail(value) {
	const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  return emailRegExp.test(String(value));
}

function isPhoneNumber(value) {
	const telphoneNumberRegExp = /(?:^\d{3,4}-\d{7,8}$)|(?:^\d{10}$)/;
  return telphoneNumberRegExp.test(String(value));
}

/**
 * 身份证ID解析器
 *
 * 根据身份证号字段分析计算, 输出信息如下:
 * 年龄
 * 性别
 * 出生年月日
 * 省份编码
 * 城市编码
 * 地区编码的个人信息对象
 *
 * @param {string} value
 * @return {obj} 返回包含个人信息的对象
 */

function IDParser (value) {
	const v = String(value); //value
	const r = {}; // retval

	// 个人基本信息
  r.sex = Number(v.charAt(16))%2 === 0 ? '女' : '男';
	r.birth = v.substr(6,8).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3");
	r.age = ((Date.now() - Date.parse(r.birth))/31536000000).toFixed();

	// 仅能说明籍贯信息, 当前所在城市还需要另行获取
	r.stateCode = v.substr(0,3) + '000';
	r.cityCode = v.substr(0,4) + '00';
	r.regionCode = v.substr(0, 6);

	return r;
}

/**
 *
 *
 */

function isInteger (value) {
	const integerStringRegExp = /^-?(0|[1-9][0-9]*)$/;
  return typeof value === 'number' && 
		Number.isFinite(value) && 
		Math.floor(value) === value;
}


/**
 * 解析csv字符串为JSON
 */

function csvToJSON(csv) {
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
