/**
 * *****************************************************************************
 *
 * 打印分隔线
 *
 * *****************************************************************************
 */

export function divideLine (symbol = '=') {
  const columns = process && process.stdout ? process.stdout.columns : 80;
  return new Array(columns).join(symbol);
}
