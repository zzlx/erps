/**
 * *****************************************************************************
 *
 * PostgreSQL client
 * 
 * [postgres](https://www.postgresql.org)
 * [node-postgres](https://node-postgres.com)
 * ../../node_modules/pg/README.md
 *
 * *****************************************************************************
 */

import pg from 'pg';
import util from 'util';
import { DBA } from './DBA.mjs';

const { Pool, Client } = pg;
const debug = util.debuglog('debug:postgres');

// 系统数据库配置信息
const defaults = { // default options
  connectionString: null,
  host: 'localhost',
  prot: 5432,
  user: process.env.USER,
  database: process.env.USER,
  password: null,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export class Postgres extends DBA {
  constructor (options) {
    super();
    this.opts = Object.assign({}, defaults, options); 
  }

  get client () {
    const client = new Client(this.opts);
    client.connect();
    return client;
  }

  get pool () {
    if (this._pool) return this._pool;
    this._pool = new Pool(this.opts);
    this._pool.on('error', (err, client) => {
      if (err) console.error('Error on idle client', err);
    });
    return this._pool;
  }

  query () {
    const start = Date.now();
    const args = Array.prototype.slice.call(arguments);

    if (typeof args[args.length-1] !== 'function') {
      return this.pool.query(...args).then(res => {
        const duration = Date.now() - start;
        console.log('executed query', { duration })
        return res;
      });
    }

    const callback = args.pop();

    return this.pool.query(...args, (err, res) => {
      const duration = Date.now() - start;
      console.log('executed query', { duration })
      callback(err, res)
    });
  }
}
