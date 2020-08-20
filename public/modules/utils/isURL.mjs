export default function isURL (str) {
	return /[a-zA-z]+:\/\/[^\s]*/.test(str);
}
