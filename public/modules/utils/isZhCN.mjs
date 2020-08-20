export default function isZhCN(value) {
	const zhCNRegExp = /[\u4e00-\u9fa5]/;
  return zhCNRegExp.test(String(value));
}
