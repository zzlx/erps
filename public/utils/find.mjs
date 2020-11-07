/*
 * *****************************************************************************
 *
 * Find取数工具
 *
 * @param {object} query 查询语句
 * @param {object} projection
 * @return {object|array|null} retval
 * *****************************************************************************
 */

export default function find (query = {}, projection = {}) {

  // 检查参数
  if (query && 'object' !== typeof query) {
    throw new TypeError('The parameter `query` must be an object.'); 
  }

  if (projection && 'object' !== typeof projection) {
    throw new TypeError('The parameter `projection` must be an object.'); 
  }

  // 执行取数逻辑
  const data = this;
  if (data == null) return null;
  let result = data;

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
