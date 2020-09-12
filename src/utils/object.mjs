/**
 * 对象功能扩展
 *
 * @param {object} obj
 * @return {object}
 * @api public
 */

export default function (obj) {
    return new Proxy(obj, { 
        get: function (target, property, receiver) { 
            if (property === 'getIn') { 
                receiver.getIn = getIn; 
            }

			return Reflect.get(target, property, receiver);
		}
    });
}


function reduceObj (obj, keyReducer) {
		const retval = {};

		for (let key of Object.keys(keyReducer)) {
			const fn = 'function' === typeof keyReducer[key] 
				? keyReducer[key] 
				: String;
			retval[key] = obj[key] ? fn(obj[key]) : null;
		}

		return retval;
}

/**
 * get value from obj
 *
 * @param {array} valuePath
 * @return {string|object|array} value
 * @api public
 */

function getIn(path) {
    let value = this;

    if (null == value) return null;
    if (null == path) return value;

    for (let item of path) {
        if (value[item]) {
            value = value[item];
            continue;
        } 

        value = null;
        break;
    }

    return value
} 
