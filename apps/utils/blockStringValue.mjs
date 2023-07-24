/**
 * *****************************************************************************
 *
 * Produces the value of a block string from its parsed raw value,
 * similar to CoffeeScript's block string, Python's docstring trim 
 * or Ruby's strip_heredoc.
 *
 * This implements the GraphQL spec's BlockStringValue() static algorithm.
 *
 * *****************************************************************************
 */

export function blockStringValue(rawString) {
  // Expand a block string's raw value into independent lines.
  // Remove common indentation from all lines but first.
  const lines = rawString.split(/\r\n|[\n\r]/g); 

  let commonIndent = null;

  // 遍历所有行
  // 计算出通用缩进位置
  for (const line of lines) {
    const indent = leadingWhitespace(line); // 获取缩进的位置

    if (indent < line.length && (commonIndent === null || indent < commonIndent)) {
      commonIndent = indent;
      if (commonIndent === 0) break;
    }
  }

  //
  if (commonIndent) {
    for (let i = 1; i < lines.length; i++) {
      lines[i] = lines[i].slice(commonIndent);
    }
  } 

  // Remove leading blank lines.
  while (lines.length > 0 && isBlank(lines[0])) {
    lines.shift();
  }

  // Remove trailing blank lines.
  while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
    lines.pop();
  } 

  // Return a string of the lines joined with U+000A.
  return lines.join('\n');
}

export function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) { i++; }
  return i;
}

export function isBlank(str) {
  return leadingWhitespace(str) === str.length;
}
