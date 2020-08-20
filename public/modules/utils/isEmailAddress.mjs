export default function isEmailAddress(value) {
	const emailRegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  return emailRegExp.test(String(value));
}
