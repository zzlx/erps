/*
 * *****************************************************************************
 *
 * find 工具
 *
 * 从data对象中取字段的值
 *
 * data数据对象格式:
 *
 * ```javascript
 * const data = {
 *  table_1: [
 *    col_1: '',
 *    col_2: '',
 *  ], 
 *  table_2: [], 
 *  table_3: [], 
 * }
 * ```
 * 
 * 使用方法:
 * 提供this数据对象
 *
 * @param {object} query 查询语句
 * @param {object} projection
 * @return {object|array|null} retval
 * *****************************************************************************
 */

export default function find (query = {}, projection = {}) {
  if (this == null) return null; // 未提供this时,直接返回null

  if (typeof query !== 'object' ) {
    throw new TypeError('The `query` parameter of find must be an object.'); 
  }

  const data = this;

  let result = Object.create(null);

  // find algorithm:
  //
  // parse query
  for (const key of Object.keys(data)) {
    const value = query[key];
    if (value) result[key] = data[key];
  } 

  // projection

  //
  return result;
}
