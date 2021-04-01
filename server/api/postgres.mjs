/**
 * *****************************************************************************
 * PostgreSQL客户端接口
 * 
 * *****************************************************************************
 */

import pg from 'pg';
import settings from '../settings/index.mjs';
import debuglog from '../debuglog.mjs';

const debug = debuglog('debug:postgres');
const Client = pg.Client;
const Pool = pg.Pool;

const options = {
  user: settings.configs.PGUSER,
  host: 'localhost',
  database: settings.configs.PGDATABASE,
  password: settings.configs.PGPASSWORD,
};

const pool = new Pool(options);
pool.on('error', (err, client) => {
  debug('Unexpected error', err);
});

pool.connect().then();

const client = new Client(options);

await client.connect();

//const res = await client.query('SELECT * from pg_roles;');
const res = await client.query('SELECT NOW();');
console.log(res); 
await client.end();

class PostgreSQLClient {
  query () {
    return this.client.query(...arguments);
  }
}

export default new Proxy(new PostgreSQLClient(), {
  get: function (target, property, receiver) {
  },
}); 
