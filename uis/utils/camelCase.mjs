/**
 * *****************************************************************************
 *
 * Camel case functionality
 *
 * 驼峰命名法（Camel-Case）
 *
 * @param {string} value
 * @param {boolean} capitalized
 * @return {string} CamelCaseString
 *
 * *****************************************************************************
 */

export default function camelCase (value, capitalized = true) {
  return value.toLowerCase()
    .replace(/\./g, '-')
    .replace(/(\b|-|_)\w/g, m => m.toUpperCase())
    .replace(/_|-|\s+\W/g, '')
    .replace(/^\w/, m => capitalized ? m : m.toLowerCase())
}
