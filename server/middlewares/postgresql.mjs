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

// import util from "node:util";
import { PostgresDBA } from "../database/PostgresDBA.mjs";

// const debug = util.debuglog("debug:postgresql-middleware");
const DBA = Symbol("postgresqlClient");

export function postgresql (options = {}) {
  const dba = {};

  return function postgresqlMiddleware (ctx, next) {
    Object.defineProperty(ctx, "dba", {
      get: () => {
        if (dba[DBA] == null) {
          dba[DBA] = new PostgresDBA(options);
        }
        return dba[DBA];
      },
      enumerable : true,
      configurable : true,
    });

    return next();
  };
}
