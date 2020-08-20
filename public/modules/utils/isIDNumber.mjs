export default function isIDNumber(value) {
	const idNumberRegExp = /^\d{15}|\d{18}$/;
  return idNumberRegExp.test(String(value));
}
