/**
 * *****************************************************************************
 * 
 * Math
 *
 * 数学计算扩展
 *
 * *****************************************************************************
 */

export const math = new Proxy(Math, {
	get: function (target, property, receiver) {
		return Reflect.get(target, property, receiver);
	}
});


function plus () {
	let sum = 0;

	for (let v of arguments) {
		sum += Number(v);
	}

	return sum;
}
