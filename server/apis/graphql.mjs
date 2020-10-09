/**
 * *****************************************************************************
 *
 * GraphQL API数据服务
 *
 * 逻辑:
 * 1. POST请求中获取body查询字段;
 * 2. 判断query字段，若未提供，则根据operationName,从务器读取一份标准graphql查询;
 * 3. 执行graphql查询;
 * 4. 返回查询数据;
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { graphql, buildASTSchema, parse, Source } from '../../src/graphql/index.mjs';
import getResolvers from '../../src/utils/getModulesFromPath.mjs';
import settings from '../../config/settings.mjs';

const paths = settings.paths;
const schemaPath = path.join(paths.SERVER, 'schema');
const resolversPath = path.join(paths.SERVER, 'resolvers');
let schema = null;
let fieldResolver = null;

export default async function graphqlAPI (ctx, next) {

  ctx.cookies.set('test', '123');

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
    return;
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
    const body = await ctx.getRawBody();
    request = body && JSON.parse(body);
  }

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
}
