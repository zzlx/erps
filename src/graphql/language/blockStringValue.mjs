/**
 * Produces the value of a block string from its parsed raw value,
 * similar to CoffeeScript's block string, Python's docstring trim 
 * or Ruby's strip_heredoc.
 *
 * This implements the GraphQL spec's BlockStringValue() static algorithm.
 *
 */

export default function blockStringValue(rawString) {
  // Expand a block string's raw value into independent lines.
  // Remove common indentation from all lines but first.
  const lines = rawString.split(/\r\n|[\n\r]/g); 

  // indent
  let commonIndent = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const indent = leadingWhitespace(line);

    if (indent < line.length && (commonIndent === null || indent < commonIndent)) {
      commonIndent = indent;

      if (commonIndent === 0) {
        break;
      }
    }
  }

  if (commonIndent) {
    for (let _i = 1; _i < lines.length; _i++) {
      lines[_i] = lines[_i].slice(commonIndent);
    }
  } 

  // Remove leading and trailing blank lines.
  while (lines.length > 0 && isBlank(lines[0])) {
    lines.shift();
  }

  while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
    lines.pop();
  } // Return a string of the lines joined with U+000A.


  return lines.join('\n');
}

function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && (str[i] === ' ' || str[i] === '\t')) { i++; }
  return i;
}

function isBlank(str) {
  return leadingWhitespace(str) === str.length;
}
