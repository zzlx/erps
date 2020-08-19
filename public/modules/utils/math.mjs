/**
 * *****************************************************************************
 * 
 * Math
 *
 * 数学计算扩展
 *
 * *****************************************************************************
 */

export default new Proxy(Math, {
	get: function (target, prop, receiver) {
		return prop in target ? target[prop] : null;
	}
});


function plus () {
	let sum = 0;

	for (let v of arguments) {
		sum += Number(v);
	}

	return sum;
}
