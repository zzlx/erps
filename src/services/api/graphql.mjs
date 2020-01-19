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
/**
 * GraphQL查询服务
 *
 *
 * 为前端应用程序提供数据服务
 *
 */

import path from 'path';
import util from 'util';
import getRawBody from '../../server/getRawBody.mjs';
import { graphql, buildASTSchema, parse, Source } from '../../graphql/index.mjs';
import getResolvers from '../../utils/getModulesFromPath.mjs';
import { APP_PATH } from '../../config.mjs';

const debug = util.debuglog('debug:graphql');
const schemaPath = path.join(APP_PATH, 'src', 'schema');
const resolversPath = path.join(APP_PATH, 'src', 'resolvers');
let schema = null;
let fieldResolver = null;

export default async function graphqlAPI (ctx, next) {

  if (schema == null) {
    schema = await fs.promises.readdir(schemaPath, { encoding: 'utf8' }).then(files => {
      return files.filter(file => file.match(/\.gql$/))
    }).then(files => {
      return Promise.all(files.map(file => fs.promises.readFile(path.join(schemaPath, file), 'utf8')))
    }).then(content => {
      return content.join(os.EOL)
    }).then(schema => {
      const source = parse(schema);
      return buildASTSchema(source);
    });
  }

  if (fieldResolver == null) {
    // 获取resolvers
    fieldResolver = await getResolvers(resolversPath);
  }

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

  try {
    // 执行graphql解析查询
    ctx.body = await graphql({
      schema: schema, 
      source: request.query || '{welcome}',
      rootValue: {},
      contextValue: ctx,
      variableValues: request.variables,
      operationName: request.operationName,
      fieldResolver: fieldResolver,
    });
  } catch (e) {
    console.log(e);
    ctx.body = e;
  }
}
