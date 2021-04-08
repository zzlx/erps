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
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import { graphql, buildASTSchema, parse, Source } from '../graphql/index.mjs';
import settings from '../settings/index.mjs';
import debuglog from '../debuglog.mjs';

const __file = import.meta.url.substr(7);
const __dirname = path.dirname(import.meta.url.substr(7));

const debug = debuglog('debug:GraphQL_Query');

const schemaPath = path.join(settings.paths.SRC, 'schema');
const schema = await fs.promises.readdir(schemaPath, { encoding: 'utf8' })
.then(files => files.filter(file => file.match(/\.gql$/)))
.then(files => Promise.all(
  files.map(file => fs.promises.readFile(path.join(schemaPath, file), 'utf8')))
)
.then(content => content.join(os.EOL))
.then(schema => buildASTSchema(parse(schema)));

const fieldResolver = await getModules(path.join(path.dirname(__dirname), 'resolvers')); 

export default function graphqlQuery (query, variables, operationName) {

  return graphql({
    schema: schema, 
    source: query,
    rootValue: {},
    contextValue: {}, // 用于传递上下文数据
    variableValues: variables,
    operationName: operationName,
    fieldResolver: fieldResolver,
  });
}

// test
if (process.env.NODE_ENV === 'test') { 
  graphqlQuery('{help}').then(res => debug(res)); 
}

/**
 * *****************************************************************************
 * Utility functions
 * *****************************************************************************
 */

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
