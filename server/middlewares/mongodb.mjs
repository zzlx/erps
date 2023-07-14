/**
 * *****************************************************************************
 *
 * DBA数据库管理
 *
 * 支持的数据库连接工具
 * mongodb: 提供mongo数据库连接
 *
 *
 * MongoDB Administrator
 * 
 * 
 * 参考文档
 * [documentation](http://mongodb.github.io/node-mongodb-native)
 * [api-doc](http://mongodb.github.io/node-mongodb-native/3.1/api)
 * 
 *
 * @todo: 增加支持sql/mysql/db2/oracal/等数据库
 *
 * *****************************************************************************
 */

import mongodb from 'mongodb'; 
const MongoDBA = mongodb.MongoDBA;
const MongoClient = Symbol('mongoClient');

export function mongodb (opts = null) {

	let mongodbURL = opts && opts.mongodb
    ? new URL(opts.mongodb)
    : new URL('mongodb://localhost:27017/test');

  return async function mongodbMiddleware (ctx, next) {
    Object.defineProperty(ctx, 'mongodb', {
      get: function() {
        if (this[MongoClient] == null) {
          this[MongoClient] = new MongoDBA(mongodbURL.href, {
            useNewUrlParser: true,
            //sslValidate: true,
            //sslCA: fs.readFileSync(),
            //sslCert: fs.readFileSync(),
          });
        }

        return this[MongoClient];
      },
      enumerable : true,
      configurable : true,
    });

    await next();

    // close mongoClient
    if (ctx._mongoClient && ctx._mongoClient.topology) ctx._mongoClient.close();
  }
}

new Proxy(mongodb, {
	apply: function (target, thisArg, argumentsList) {
    return new target.MongoClient(...argumentsList);
	},

	construct: function (target, argumentsList, newTarget) {
    newTarget.MongoClient = this.apply(target, null, argumentsList);
    return newTarget; // 返回proxy实例
	},

	get: function (target, property, receiver) {
    if (property == 'connect') {
      return () => receiver.MongoClient.connect().then(client => {
          receiver._client = client;
          return client;
      });

    }

    if (property === 'client') {
      if (null == receiver._client)  {
        return receiver.MongoClient.connect().then(client => {
          receiver._client = client;
          return client;
        });
      }

      return receiver._client;
    }

    if (property === 'db') {
      if (null == receiver._db) {
        receiver._db = receiver._client.db(); 
      }

      return receiver._db;
    }

    if (property === 'tables') {
      return receiver.db.listCollections({}, {nameOnly: true}).toArray();
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
