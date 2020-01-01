import assert from 'assert';
import mongodb from 'mongodb'; 

/**
 * MongoDB Administrator
 * 
 * @api public
 */

export default new Proxy(mongodb, {
		apply: function (target, thisArg, argumentsList) {
				const MongoClient = target['MongoClient'];
        return new MongoClient(...argumentList);
		},
		construct: function (target, argumentsList, newTarget) {
				newTarget.client = this.apply(target, null, argumentsList);
				return newTarget; 
		},
		get: function (target, property, receiver) {
				if (name === 'prototype') {
						return target.prototype;
				}

				return Reflect.get(target, property, receiver);
		},

		set: function (target, property, value) {
			if (property === 'collection') {
					return true;
			}

			target[property] = value;
			return true;
		},

		defineProperty: function (target, key, desc) {
				return target;
		},

		deleteProperty: function (target, key) {
				if (key in target) return false; // forbit delete 
		},

		enumerate: function (target, key) {
				return target[key];
		},

		getPrototypeOf: function (target) {
				return target;
		},

		has: function (target, key) {
				return key in target;
		},

		isExtensible: function (target) {
				return Reflect.isExtensible(target);
		},

		ownKeys: function (target, key) {
				return target[key];
		},

		preventExtensions: function (target) {
				target.canEvolve = false;
				return Reflect.preventExtensions(target);
		},

		getOwnPropertyDescriptor: function (target, key) {
				const value = target[key];
				return value ? {
						"value": value,
						"writable": true,
						"enumerable": true,
						"configurable": false
				}: undefined;
		}
});
