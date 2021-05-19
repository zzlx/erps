/**
 * *****************************************************************************
 *
 * 驼峰化（Camel-Case）
 *
 * @param {string} value
 * @param {boolean} capitalized
 * @return {string} CamelCaseString
 *
 * *****************************************************************************
 */

export const camelCase = (value, capitalized = false) => value.toLowerCase()
  .replace(/\./g, '-')
  .replace(/(\b|-|_)\w/g, m => m.toUpperCase())
  .replace(/_|-|\W/g, '')
  .replace(/^\w/, m => capitalized ? m : m.toLowerCase());
