/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import pg from "pg";
import { DBA } from "./DBA.mjs";

export const CLIENT = Symbol('context#accept');

export class Postgresql extends DBA {
  constructor(opts = {}) {
    super();
    this.name = 'PostgresqlDBA';
  }

  query () {
    // 执行一次查询

  }

  get client () {

  }
}


// test
const { Client } = pg;
const client = new Client();
await client.connect();

const res = await client.query("SELECT $1::text as message", ["Hello world!"])
console.log(res.rows[0].message) // Hello world!
await client.end();
