/**
 * *****************************************************************************
 *
 * 驼峰命名法（Camel-Case）
 *
 * *****************************************************************************
 */

export default function camelCase (value, capitalized) {
  return value
    .toLowerCase()
    .replace(/(\b|-|_)\w/g, m => m.toUpperCase())
    .replace(/_|-|\s+|\W/,'');
}
