/**
 * *****************************************************************************
 *
 * Represents a location in a Source.
 *
 * Takes a Source and a UTF-8 character offset, 
 * and returns the corresponding line and column as a SourceLocation.
 *
 * *****************************************************************************
 */

export function getLocation(source, position) {
  const lineRegexp = /\r\n|[\n\r]/g;

  let line = 1;
  let column = position + 1;
  let match;

  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
    // 行算法: 自增1行
    line += 1; 

    // 列算法: 位置 + 1 减 行起始位置索引 减 行分隔符占用字节数
    column = position + 1 - match.index - match[0].length; // 设置列
  }

  return { 
    line: line, 
    column: column 
  };
}
