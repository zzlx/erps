/**
 * MongoDB Administrator
 * 
 * 
 * 参考文档
 * [documentation](http://mongodb.github.io/node-mongodb-native)
 * [api-doc](http://mongodb.github.io/node-mongodb-native/3.1/api)
 * 
 * @api public
 */

import assert from 'assert';
import mongodb from 'mongodb'; 

export default new Proxy(mongodb, {
	apply: function (target, thisArg, argumentsList) {
    const MongoClient = target['MongoClient'];
    return new MongoClient(...argumentsList);
	},

	construct: function (target, argumentsList, newTarget) {
    newTarget.MongoClient = this.apply(target, null, argumentsList);
    return newTarget; 
	},

	get: function (target, property, receiver) {
		if (property === 'prototype') return target.prototype;
    if (property === 'connect') {
      return target['MongoClient'].connect;
    }

    if (property === 'client') {
      if (receiver._client) receiver._client;
      return receiver.MongoClient.connect().then(client => {
        receiver._client = client;
        return client;
      });
    }

    if (property === 'db') {
      return reveiver._client.db();
    }

		return Reflect.get(target, property, receiver);
	},

	set: function (target, property, value) {
		if (property === 'collection') return true;
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
