/**
 * *****************************************************************************
 * PostgreSQL客户端接口
 * 
 * [node-postgres](https://node-postgres.com)
 *
 * *****************************************************************************
 */

import pg from 'pg';
import settings from '../settings/index.mjs';
import debuglog from '../debuglog.mjs';

const debug = debuglog('debug:postgres');
const { Pool } = pg;

const options = {
  host: 'localhost',
  user: settings.configs.PGUSER,
  max: 20, // 连接池最大客户端数量
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  database: settings.configs.PGDATABASE,
  password: settings.configs.PGPASSWORD,
};

class PostgreSQLPool {
  constructor () {
    this.pool = new Pool(options);

    this.pool.on('error', (err, client) => {
      debug('Unexpected error', err);
    });

  }

  async query (text, params) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    debug('Executed query', {text, duration, rows: res.rowCount});
    return res;
  }
}

export new PostgreSQLPool();

async function transactionQuery () {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const queryText = 'INSERT INTO users(name) VALUES($1) RETURNING id';
    const res = await client.query(queryText, ['test']);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
