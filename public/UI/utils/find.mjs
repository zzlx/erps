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

import assert from './assert.mjs';

export default function find (query = {}, projection = {}) {
  const { data } = this;
  assert(Array.isArray(data), 'Data must be an array object');

  let result = null;

  // 遍历data数组
  for (const doc of data) {
    for (const k of Object.keys(query)) {
      if (doc[k] !== query[k]) {
        continue;
      }
    }

    result = doc;
  }

  return result;
}
