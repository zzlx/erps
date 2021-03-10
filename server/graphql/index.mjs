/**
 * *****************************************************************************
 *
 * GraphQL API
 *
 * 逻辑:
 * 1. POST请求中获取body查询字段;
 * 2. 判断query字段，若未提供，则根据operationName,从务器读取一份标准graphql查询;
 * 3. 执行graphql查询;
 * 4. 返回查询数据;
 *
 *
 * @TODO: 服务器首次响应无效
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import { graphql, buildASTSchema, parse, Source } from './modules.mjs';
import settings from '../settings/index.mjs';

const debug = util.debuglog('node:graphql.mjs');
const paths = settings.paths;
const schemaPath = path.join(paths.SRC, 'schema');
const resolversPath = path.join(paths.SERVER, 'resolvers');
let schemaPromise = fs.promises.readdir(schemaPath, { encoding: 'utf8' })
.then(files => files.filter(file => file.match(/\.gql$/)))
.then(files => Promise.all(
  files.map(file => fs.promises.readFile(path.join(schemaPath, file), 'utf8')))
)
.then(content => content.join(os.EOL))
.then(schema => {
  const source = parse(schema);
  return buildASTSchema(source);
});

const schema = await schemaPromise;
const fieldResolver = await getModules(resolversPath); 

export default async function graphqlAPI () {
  return graphql({
    schema: schema, 
    source: '{welcome}',
    rootValue: {},
    contextValue: {},
    variableValues: request.variables,
    operationName: request.operationName,
    fieldResolver: fieldResolver,
  });
}

/**
 * 读取目录模块 
 *
 * 遍历文件并读入模块对象中
 */

function getModules (dir) {

  if (!path.isAbsolute(dir)) dir = path.join(process.cwd(), dir);

  // return a promise 
  return fs.promises.readdir(dir, { 
    encoding: 'utf8', 
    withFileTypes: true,
  }).then( async (files) => {
    const Modules = {};

    for (let f of files) {
      if (f.isDirectory()) {
        Modules[f.name] = await getModules(path.join(dir, f.name));
      }

      if (f.isFile() && f.name.match(/\.mjs$/)) {
        await import(path.join(dir, f.name)).then(fn => {
          Modules[path.basename(f.name, '.mjs')] = fn.default ? fn.default : fn;
        }).catch(err => {
          console.log('file: %s %o', f.name, err);
        });
      }
    }

    return Modules;
  });
}
