/**
 * *****************************************************************************
 *
 * math modules
 *
 * 模块计数: 1
 * 模块说明: 此模块由工具自动生成
 * 生成时间: 2021/5/13 下午3:59:13
 * *****************************************************************************
 */

export const math = new Proxy({}, {
});

export function plus () {
	let sum = 0;

	for (let v of arguments) {
		sum += Number(v);
	}

	return sum;
}

if (!Number.EPSILON) {
  Number.EPSILON = Math.pow(2, -52);
}

export const equalNumber = (n1, n2) => {
  return Math.abs(n1 - n2) < Number.EPSILON;
}
