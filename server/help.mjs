/**
 * *****************************************************************************
 *
 * 显示帮助信息
 *
 * *****************************************************************************
 */

const divideLine = new Array(process.stdout.columns).join("-");

export const help = () => process.stdout.write(`${divideLine}
Command Line Help Message

Usage: [options]

Options:
  -h, --help                  显示帮助信息
  -v, --version               显示版本信息
  --start                     启动服务
  --stop                      关闭服务
  --restart                   重启服务
${divideLine}
`);
