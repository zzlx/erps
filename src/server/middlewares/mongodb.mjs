/**
 * mongo.mjs
 *
 * mongodb中间件: 提供mongo数据库连接
 *
 *
 * @todo: 增加支持sql/mysql/db2/oracal/等数据库
 *
 */

import assert from 'assert';
import { 
	MongoDBA 
} from '../../databases/index.mjs';

export default function (opts = null) {
  // 参数配置
  if (null == opts) {
    opts = new URL('mongodb://localhost:27017/test'); 
  };

  if ('string' === typeof opts) {
    opts = new URL(opts);
  }

  return async function mongodbMiddleware (ctx, next) {
    // 使用时初始化
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
