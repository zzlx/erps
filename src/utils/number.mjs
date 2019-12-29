/**
 * 数值处理 
 * 
 * JavaScript的Number类型为双精度IEEE 754 64位浮点类型。 
 * BigInt 任意精度数字类型
 *
 * @param {[number|string]} value
 * @param {object} a proxy object
 * @api public
 */

export default function (value) {

		// 判断value是否为number
	  // 或是value是否可转为number

		return new Proxy(value, {
				apply: function (target, thisArg, argumentsList) {
					return target(...argumentsList);
				},

				construct: function (target, argumentsList, newTarget ) {

					return new target(...argumentsList);
				},

				get: function (target, prop, receiver) {

					return prop in target ? target[prop] : null;
				},

				set: function (target, property, value, reveiver) {
					return true;
				},
	  });
}

/**
 *
 *
 */

function toLocaleString () {
}
