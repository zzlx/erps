/**
 * 返回start~end之间随机整数
 *
 * @param {number} start
 * @param {number} end
 * @returns {number} random
 */

export default function randomNumber (start = 0, end = 100) {
  let random = Math.floor(Math.random() * (end - start)) + start;
  return random;
}

// test
//console.log(randomNumber(0, 10));
