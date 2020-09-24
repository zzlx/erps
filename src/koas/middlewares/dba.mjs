/**
 * *****************************************************************************
 *
 * DBA数据库管理
 *
 * 支持的数据库连接工具
 * mongodb: 提供mongo数据库连接
 *
 *
 * @todo: 增加支持sql/mysql/db2/oracal/等数据库
 *
 * *****************************************************************************
 */

import MongoDBA from '../../database/mongodb.mjs';

const MongoClient = Symbol('mongoClient');

export default function (opts = null) {

	let mongodbURL = opts && opts.mongodb
    ? new URL(opts.mongodb)
    : new URL('mongodb://localhost:27017/test');

  return async function dbaMiddleware (ctx, next) {

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
