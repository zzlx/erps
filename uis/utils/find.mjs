/*
 * *****************************************************************************
 *
 * Find取数工具
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

export default function find (query = {}, projection = {}) {

  // 检查参数
  assertObject(query);
  assertObject(projection);

  // 执行取数逻辑
  const data = this;
  if (data == null) return null;

  let result = null;

  const keys = Object.keys(query);
  if (keys.length === 0) result = data;
  if (keys.length > 1) result = {};
  //
  // parse query
  for (const key of keys) {
    if (query[key] && data[key]) result = data[key];
  } 

  // projection

  //
  return result;
}

function getValueByKey () {
}

function assertObject (value) {
  if (value && 'object' !== typeof value) {
    throw new TypeError(`The paramater value must be an object.`); 
  }
}
