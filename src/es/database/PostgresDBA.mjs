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
import Cursor from 'pg-cursor'
import { DBA } from "./DBA.mjs";

const debug = util.debuglog("debug:postgres-dba");
const CLIENT = Symbol("client");
const POOL = Symbol("pool");

export class PostgresDBA extends DBA {

  /**
   *
   * Options:
   *
   * user?: string, // default process.env.PGUSER || process.env.USER
   * password?: string or function, //default process.env.PGPASSWORD
   * host?: string, // default process.env.PGHOST
   * database?: string, // default process.env.PGDATABASE || user
   * port?: number, // default process.env.PGPORT
   * connectionString?: string, // e.g. postgres://user:password@host:5432/database
   * ssl?: any, // passed directly to node.TLSSocket, supports all tls.connect options
   * types?: any, // custom type parsers
   * statement_timeout?: number, // number of milliseconds before a statement in query will time out, default is no timeout
   * query_timeout?: number, // number of milliseconds before a query call will timeout, default is no timeout
   * application_name?: string, // The name of the application that created this Client instance
   * connectionTimeoutMillis?: number, // number of milliseconds to wait for connection, default is no timeout
   * idle_in_transaction_session_timeout?: number // number of milliseconds before terminating any session with an open idle transaction, default is no timeout
   *
   */

  constructor (options) {
    super();
    this.opts = Object.assign({}, {
      ssl: false,
    }, options);

    this.name = "PostgresDBA";
  }

  /**
   * Construct a new pool instance
   *
   * The pool is initially created empty and will create new clients lazily as they are needed.
   *
   * Events:
   *
   * * connect
   * * acquire
   * * error
   * * release
   * * remove
   *
   */

  get pool () {
    if (this[POOL] == null) {
      const config = Object.assign({}, {
        connectionTimeoutMillis: 2000, // timeout 
        idleTimeoutMillis: 10000, // 10 seconds
        max: 10, // maximum number of clients the pool should contain default set 10
        allowExitOnIdle: true,
      }, this.opts);

      this[POOL] = new pg.Pool(config);
    }
    return this[POOL];
  }

  get totalCount () {
    return this.pool.totalCount;
  }

  get idleCount () {
    return this.pool.idleCount;
  }

  get waitingCount () {
    return this.pool.waitingCount;
  }

  connect () {
    return this.pool.connect();
  }

  query () {
    return this.pool.query(...arguments);
  }
}
