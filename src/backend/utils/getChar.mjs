/**
 * *****************************************************************************
 *
 * 命令行交互式工具
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符
 *
 * *****************************************************************************
 */

function getChar () {
  const question = arguments[0];

  process.stdout.write(String(question));

  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}
