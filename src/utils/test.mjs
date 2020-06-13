/**
 * 用于测试
 *
 * 生产环境下不执行
 *
 * Usage:
 *
 * ```
 * test.then(() => {
 * // 仅测试环境才会执行的任务
 * });
 *
 * ```
 *
 */

export default new Promise((resolve, reject) => {
  console.log(process.env);

  if (process && process.env.NODE_ENV === 'test') {
    resolve(true);
    //reject('生产环境');
    //resolve(false);
    return;
  }
});
