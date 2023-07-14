/**
 * *****************************************************************************
 *
 * PostgreSQL 客户端程序
 *
 * [node-postgres](https://node-postgres.com)项目提供的pg是用于在node环境下接口模块
 *
 * *****************************************************************************
 */

import util from "node:util";
import pg from "pg";

const debug = util.debuglog("debug:PostgreSQL-DBA");
const CLIENT = Symbol("context#accept");

export function postgresql (options) {
  const opts = Object.assign({}, {
      ssl: false,
      port: 5432,
  }, options);

  return new pg.Client(opts);
}

// test
//
// const c = postgresql();
// const res = await c.query("SELECT $1::text as message", ["Hello world!"]);
// console.log(res);
// if (res) console.log(res.rows[0].message);
// await c.client.end();
const pool = new pg.Pool();
const result = await pool.query('SELECT $1::text as name', ['brianc']);
console.log(result.rows[0].name)
