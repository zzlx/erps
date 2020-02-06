/**
 * 返回start~end之间随机整数
 *
 * @param {number} start
 * @param {number} end
 *
 */

export default function randomNumber (start = 0, end = 100) {
  return Math.floor(Math.random() * (end - start)) + start;
}

// test
//console.log(randomNumber(0, 500));
