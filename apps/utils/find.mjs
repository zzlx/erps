/*
 * *****************************************************************************
 *
 * Find取数工具
 *
 * 从数组中取出符合条件的一条记录
 *
 * Find algorithm:
 *
 * * 每次仅取一个数据表
 *
 * @param {object} query 查询语句
 * @param {object} projection
 * @return {object|array|null} retval
 *
 * *****************************************************************************
 */

import { assert } from './assert.mjs';

export function find (query = {}, projection = {}) {
  const { data } = this;
  assert(Array.isArray(data), 'Data must be an array object');

  let result = null;

  for (const doc of data) {
    for (const key of Object.keys(query)) {
      if (doc[key] !== query[key]) {
        continue;
      }
    }

    result = doc;
  }

  return result;
}
