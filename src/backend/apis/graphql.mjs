/**
 * GraphQL API数据服务
 *
 * 中间件逻辑:
 * 1. POST请求中获取body查询字段;
 * 2. 判断query字段，若未提供，则根据operationName,从务器读取一份标准graphql查询;
 * 3. 执行graphql查询;
 * 4. 返回查询数据;
 *
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import getRawBody from '../common/getRawBody.mjs';
import { 
	graphql, buildASTSchema, parse, Source 
} from '../../graphql/index.mjs';
import getResolvers from '../../utils/getModulesFromPath.mjs';
const debug = util.debuglog('debug:graphql');

export default function (opts) {
  opts = opts || {};
  opts.cors = opts.cors || '*';

  if (null == opts.schemaPath) {
    throw new Error('请配置schema路径');
  }

  if (null == opts.resolversPath) {
    throw new Error('请配置resolvers路径');
  }

  fs.promises.readdir(opts.schemaPath, { encoding: 'utf8' })
    .then(files => {
			return files.filter(file => file.match(/\.gql$/))
		}).then(files => {
			return Promise.all(files.map(file => fs.promises.readFile(path.join(opts.schemaPath, file), 'utf8')))
		}).then(content => {
			return content.join(os.EOL)
		}).then(schema => {
			const source = parse(schema);
      opts.schema = buildASTSchema(source);
    });

  // 获取resolvers
  getResolvers(opts.resolversPath).then(resolvers => { 
    opts.fieldResolver = resolvers; 
  });

  return async function graphqlAPI (ctx, next) {
    let request = Object.create(null);

    // only allowed GET/POST method
    if (!/GET|POST/.test(ctx.method)) {
      ctx.status = 405; // method not allowed.
      ctx.set('Allow', 'GET, POST');
      return await next();
    }

    if ('GET' === ctx.method) {
      request.query = ctx.searchParams.get('query');
      request.variables = ctx.searchParams.get('variables');
      request.operationName = ctx.searchParams.get('operationName');
    } 

    if ('POST' === ctx.method) {
      /*
      ctx.stream.setEncoding('utf8');
      const body = await new Promise((resolve, reject) => {
        let chunk;
        let retval;

        // 注册事件处理
        ctx.stream.on('readable', () => {
          while (null !== (chunk = ctx.stream.read())) { retval += chunk; }
        });

        resolve(retval)
      });

      */
      const body = await getRawBody(ctx.stream);
      request = body && JSON.parse(body);
    }

    // 执行graphql解析查询
    ctx.body = await graphql({
      schema: opts.schema, 
      source: request.query || '{welcome}',
      rootValue: {},
      contextValue: ctx,
      variableValues: request.variables,
      operationName: request.operationName,
      fieldResolver: opts.fieldResolver,
    });
  }
}
