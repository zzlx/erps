/**
 * *****************************************************************************
 *
 * 判断是否JSON字符串
 *
 * @param {string} value
 * @return {bool}
 * *****************************************************************************
 */

const jsonValidRegExp = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

export default function isJSON (value) {
	return jsonValidRegExp.test(value);
}
