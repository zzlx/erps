/**
 * *****************************************************************************
 *
 * 生成随机字符串
 *
 * @param len {number}
 *
 * *****************************************************************************
 */

export function randomString (len = 8) {
  return Math.random().toString(16).substring(2, 2 + len);// .split('').join('.');
}

//console.log(randomString());
