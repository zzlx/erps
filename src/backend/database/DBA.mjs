/**
 * *****************************************************************************
 *
 * Database administration
 *
 * 用于标准化数据库操作
 *
 * *****************************************************************************
 */

import EventEmitter from "node:events"; 

export class DBA extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.name = 'DBA';
  }

  /**
   * 执行一次查询
   */

  query () {

  }
}
