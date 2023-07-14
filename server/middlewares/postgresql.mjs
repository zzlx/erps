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

import pg from "pg";
const CLIENT = Symbol('postgresqlClient');

export function postgresql (opts = null) {
  return async function postgresqlMiddleware (ctx, next) {
    Object.defineProperty(ctx, 'pg', {
      get: function() {
        if (this[CLIENT] == null) {
          this[CLIENT] = new pg.Pool();
        }

        return this[CLIENT];
      },
      enumerable : true,
      configurable : true,
    });

    await next();

    // close mongoClient
    // if (ctx._mongoClient && ctx._mongoClient.topology) ctx._mongoClient.close();
  }
}
