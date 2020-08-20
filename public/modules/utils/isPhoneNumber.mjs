export default function isPhoneNumber(value) {
	const telphoneNumberRegExp = /(?:^\d{3,4}-\d{7,8}$)|(?:^\d{10}$)/;
  return telphoneNumberRegExp.test(String(value));
}
