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

import assert from 'assert';
import util from 'util';

import MongoDBA from '../../utils/mongodb.mjs';
const debug = util.debuglog('debug:middleware.mongodb');

export default function (opts = null) {
	let mongodbURL = new URL(opts ? opts : 'mongodb://localhost:27017/test');

  return async function dbaMiddleware (ctx, next) {

    Object.defineProperty(ctx, 'mongodb', {
      get: function() {
        if (this._mongoClient == null) {
          this._mongoClient = new MongoDBA(opts.href, {
            useNewUrlParser: true,
            //sslValidate: true,
            //sslCA: fs.readFileSync(),
            //sslCert: fs.readFileSync(),
          });
        }

        return this._mongoClient;
      },
      enumerable : true,
      configurable : true,
    });

    await next();

    // close mongoClient
    if (ctx._mongoClient && ctx._mongoClient.topology) ctx._mongoClient.close();
  }
}
