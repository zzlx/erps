/**
 *
 *
 */

export default function isJSON (value) {
	const jsonValidRegExp = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
	return jsonValidRegExp.test(value);
}
