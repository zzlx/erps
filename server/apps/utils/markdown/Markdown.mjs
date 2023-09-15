/**
 * *****************************************************************************
 *
 * Markdown processor
 *
 * 解析markdown字串, 生成JSON\html格式文档
 *
 * 用法:
 *
 * ```
 * const html = new Markdown('### test'); // output html format <h3></h3>
 *
 * // output json format '[{"tag": "h3", "content": "test"}]'
 * const json = new Markdown('### test', {format: 'json'}); 
 * ```
 *
 * @TODOS:
 *
 *
 * *****************************************************************************
 */

export class Markdown {
  constructor(source, options) {
    this.opts = Object.assign({}, {
      format: ['json', 'html', 'xml', 'pdf'][1],
    }, options); 

    this.contentData = []; // 存储解析后的数据

  }

  /**
   *
   *
   */

  toHTML () {
    this.opts.format = 'html';
    return this.toString();
  }

  /**
   * html format
   *
   * ```
   * const h3 = { tag: 'h3', content: 'Title'} // => <h3>Title</h3>
   *
   * const pArray = { tag: 'p', content: [
   *   'hello ',
   *   { tag: 'a', content: 'world', href: 'https://test'},
   *   '!'
   * ]}; // => <p>hello <a href="https://test">world</a>!</p>
   *
   * ```
   *
   */

  toString () {
    if (this.opts.format === 'json') return this.contentData;

    let html = '';

    // tag render
    const tr = function (o) {
      return o.content == null
        ? `<${o.tag} />`
        : typeof o.content === 'string'
          ? `<${o.tag}>${o.content}</${o.tag}>`
          : typeof o.content === 'object'
            ? tr(o)
            : '';
    }

    // 遍历内容数据,生成html字符
    for (let o of this.contentData) html += tr(o);

    return html;
  }

  // 流程图
  flowChart() {
  }

  // 序列图
  sequenceDiagram() {
  }

  // title
  titleLine () {
  }

  parse(options) {
    const source = this.source;
    const sourceObj = typeof source === 'string' 
      ? new Source(source) : source;

    if (!(sourceObj instanceof Source)) {
      throw new TypeError(
        "Must provide Source. Received: ".concat(inspect(sourceObj))
      );
    }

    const lexer = new Lexer(sourceObj, options || {});

    return parseDocument(lexer);

  }

}

// markdown 前导符号
const Directives = Object.freeze({
  "HEADER": "HEADER",
  "PARAGRAPH": "PARAGRAPH",
  "QUOTE": "QUOTE",
});

const TokenKind = Object.freeze({

  // markdown syntax
  "ASTERISK": "*",
  "BACK_QUOTE": "`",
  "HASH_MARK": "#",
  "EQUALS": "=",

  "AMP": "&",
  "AT": "@",
  "BANG": "!",
  "BRACKET_L": "[",
  "BRACKET_R": "]",
  "BRACE_L": "{",
  "BRACE_R": "}",
  "BLOCK_STRING": "BlockString",
  "COLON": ":",
  "COMMENT": "Comment",
  "DOLLAR": "$",
  "EOF": "<EOF>",
  "FLOAT": "Float",
  "INT": "Int",
  "NAME": "Name",
  "PAREN_L": "(",
  "PAREN_R": ")",
  "PIPE": "|",
  "SOF": "<SOF>",
  "SPREAD": "...",
  "STRING": "String"
});

/**
 * Token object
 */

class Tok {
  constructor (kind, start, end, line, column, prev, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.prev = prev;
    this.value = value;
    this.next = null;
  }
}

/**
 * Source object.
 */

class Source {
  constructor (body, name, locationOffset) {
    this.body = body;
    this.name = name || 'source';
    this.locationOffset = locationOffset || { line: 1, column: 1 };

    if ( this.locationOffset.line <= 0 ) {
      throw new Error('line in locationOffset is 1-indexed and must be positive');
    }

    if (this.locationOffset.column <= 0 ) {
      throw new Error('column in locationOffset is 1-indexed and must be positive');
    }
  }
}

/**
 * 词法解析器
 *
 * Given a Source object, this returns a Lexer for that source.
 *
 * Lexer is a stateful stream generator, in that every time it is advanced, 
 * it returns the next token in the Source. 
 *
 * Assuming the final Token emitted by the lexer will be of kind EOF, 
 * after which will repeatedly return the same EOF token whenever called.
 */

class Lexer {
  constructor(source, options) {
    this.source = source;
    this.options = options;
    const startOfFileToken = new Tok(TokenKind.SOF, 0, 0, 0, 0, null);
    this.token = startOfFileToken;
    this.lastToken = startOfFileToken;

    this.line = 1;
    this.lineStart = 0;
  }

  /**
   * move forword.
   */

  advance() {
    this.lastToken = this.token;   // 将上一token重置为当前token
    this.token = this.lookahead(); // 将当前token重置为下一token 
    return this.token;             // 返回当前token
  }

  /**
   * look ahead
   */

  lookahead() {
    let token = this.token; // 获取当前token

    // 如果当前token为EOF(end of file), 直接返回该token
    if (token.kind === TokenKind.EOF) return token;

    do {
      // 读取下一token
      token = token.next || (token.next = readToken(this, token));
    } while (token.kind === TokenKind.COMMENT); // 直到token类型为comment

    return token; // 返回下一token
  }

  readToken(lexer, prev) {
    const source = lexer.source;
    const body = source.body;
    const bodyLength = body.length;
    const pos = positionAfterWhitespace(body, prev.end, lexer);
    const line = lexer.line;
    const col = 1 + pos - lexer.lineStart;

    if (pos >= bodyLength) {
      return new Tok(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
    }

    // SourceCharacter
    const code = String.prototype.charCodeAt.call(body, pos); 

    switch (code) {
      case 33: // !
        return new Tok(TokenKind.BANG, pos, pos + 1, line, col, prev);
      case 35: // #
        return readComment(source, pos, line, col, prev);
      case 36: // $
        return new Tok(TokenKind.DOLLAR, pos, pos + 1, line, col, prev);
      case 38: // &
        return new Tok(TokenKind.AMP, pos, pos + 1, line, col, prev);
      case 40: // (
        return new Tok(TokenKind.PAREN_L, pos, pos + 1, line, col, prev);
      case 41: // )
        return new Tok(TokenKind.PAREN_R, pos, pos + 1, line, col, prev);
      case 46: // .
        if (charCodeAt.call(body, pos + 1) === 46 && 
            charCodeAt.call(body, pos + 2) === 46
        ) {
          return new Tok(TokenKind.SPREAD, pos, pos + 3, line, col, prev);
        }
        break;
      case 58: // :
        return new Tok(TokenKind.COLON, pos, pos + 1, line, col, prev);
      case 61: // =
        return new Tok(TokenKind.EQUALS, pos, pos + 1, line, col, prev);
      case 64: // @
        return new Tok(TokenKind.AT, pos, pos + 1, line, col, prev);
      case 91: // [
        return new Tok(TokenKind.BRACKET_L, pos, pos + 1, line, col, prev);
      case 93: // ]
        return new Tok(TokenKind.BRACKET_R, pos, pos + 1, line, col, prev);
      case 123: // {
        return new Tok(TokenKind.BRACE_L, pos, pos + 1, line, col, prev);
      case 124: // |
        return new Tok(TokenKind.PIPE, pos, pos + 1, line, col, prev);
      case 125: // }
        return new Tok(TokenKind.BRACE_R, pos, pos + 1, line, col, prev);
      // A-Z _ a-z
      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
      case 71:
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 78:
      case 79:
      case 80:
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87:
      case 88:
      case 89:
      case 90:
      case 95:
      case 97:
      case 98:
      case 99:
      case 100:
      case 101:
      case 102:
      case 103:
      case 104:
      case 105:
      case 106:
      case 107:
      case 108:
      case 109:
      case 110:
      case 111:
      case 112:
      case 113:
      case 114:
      case 115:
      case 116:
      case 117:
      case 118:
      case 119:
      case 120:
      case 121:
      case 122:
        return readName(source, pos, line, col, prev);

      // - 0-9
      case 45:
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return readNumber(source, pos, code, line, col, prev);

      // "
      case 34:
        if (charCodeAt.call(body, pos + 1) === 34 && 
            charCodeAt.call(body, pos + 2) === 34
        ) {
          return readBlockString(source, pos, line, col, prev, lexer);
        }

        return readString(source, pos, line, col, prev);
    }

    throw syntaxError(source, pos, unexpectedCharacterMessage(code));
  }
} 
/**
 * Reads from body at startPosition until it finds a non-whitespace character,
 * then returns the position of that character for lexing.
 */

function positionAfterWhitespace(body, startPosition = 0, lexer) {
  const bodyLength = body.length;
  let position = startPosition;

  while (position < bodyLength) {
    const code = String.prototype.charCodeAt.call(body, position); 

    // tab | space | BOM
    if (code === 9 || code === 32 || code === 0xfeff) {
      ++position;
    } else if (code === 10) { // \n 换行符
      ++position;

      // 记录行及起始位置
      ++lexer.line;
      lexer.lineStart = position;
    } else if (code === 13) { // \r return
      if (String.prototype.charCodeAt.call(body, position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }

      // 记录行及起始位置
      ++lexer.line;
      lexer.lineStart = position;
    } else {
      break;
    }
  }

  return position; // 返回新的位置
}

/**
 * Report a message that an unexpected character was encountered.
 */

function unexpectedCharacterMessage(code) {
  //
  if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
    return `Cannot contain the invalid character ${printCharCode(code)}.`;
  }

  // '
  if (code === 39) {
    return "Unexpected single quote character ('), did you mean to use " + 
    'a double quote (")?';
  }

  return `Cannot parse the unexpected character ${printCharCode(code)}.`;
}

/**
 * Reads a comment token from the source file.
 *
 * #[\u0009\u0020-\uFFFF]*
 */

function readComment(source, start, line, col, prev) {
  const body = source.body; 
  let code;
  let position = start;

  do {
    code = String.prototype.charCodeAt.call(body, ++position);
  } while (code !== null && (code > 0x001f || code === 0x0009)); // '\t'

  return new Tok(
    TokenKind.COMMENT, 
    start, 
    position, 
    line, 
    col, 
    prev, 
    String.prototype.slice.call(body, start + 1, position)
  );
}

/**
 * Reads a number token from the source file, 
 * either a float or an int depending on whether a decimal point appears.
 *
 * Int:   -?(0|[1-9][0-9]*)
 * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
 */

function readNumber(source, start, firstCode, line, col, prev) {
  const body = source.body;
  let code = firstCode;
  let position = start;
  let isFloat = false;

  if (code === 45) { // -
    code = charCodeAt.call(body, ++position);
  }

  if (code === 48) { // 0
    code = charCodeAt.call(body, ++position);

    if (code >= 48 && code <= 57) {
      throw syntaxError(
        source, 
        position, 
        `Invalid number, unexpected digit after 0: ${printCharCode(code)}.`
      );
    }
  } else {
    position = readDigits(source, position, code);
    code = charCodeAt.call(body, position);
  }

  if (code === 46) { // .
    isFloat = true;
    code = charCodeAt.call(body, ++position);
    position = readDigits(source, position, code);
    code = charCodeAt.call(body, position);
  }

  if (code === 69 || code === 101) { // E e
    isFloat = true;
    code = charCodeAt.call(body, ++position);

    if (code === 43 || code === 45) { // + -
      code = charCodeAt.call(body, ++position);
    }

    position = readDigits(source, position, code);
  }

  return new Tok(
    isFloat ? TokenKind.FLOAT : TokenKind.INT, 
    start, 
    position, 
    line, 
    col, 
    prev, 
    String.prototype.slice.call(body, start, position)
  );
}

/**
 * Returns the new position in the source after reading digits.
 */

function readDigits(source, start, firstCode) {
  const body = source.body;
  let position = start;
  let code = firstCode;

  // 0 - 9
  if (code >= 48 && code <= 57) {
    do {
      code = String.prototype.charCodeAt.call(body, ++position);
    } while (code >= 48 && code <= 57); // 0 - 9

    return position;
  }

  throw syntaxError(
    source, 
    position, 
    "Invalid number, expected digit but got: ".concat(printCharCode(code), ".")
  );
}

/**
 * Reads a string token from the source file.
 *
 * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
 */

function readString(source, start, line, col, prev) {
  const body = source.body;
  let position = start + 1;
  let chunkStart = position;
  let code = 0;
  let value = '';

  while (
    position < body.length && 
    (code = charCodeAt.call(body, position)) !== null && 
    code !== 0x000a  && // \n
    code !== 0x000d // \r
  ) {
    // Closing Quote (")
    if (code === 34) {
      value += slice.call(body, chunkStart, position);
      return new Tok(TokenKind.STRING, start, position + 1, line, col, prev, value);
    } 

    // SourceCharacter
    if (code < 0x0020 && code !== 0x0009) {
      throw syntaxError(
        source, 
        position, 
        "Invalid character within String: ".concat(printCharCode(code), ".")
      );
    }

    ++position;

    if (code === 92) { // \
      value += slice.call(body, chunkStart, position - 1);
      code = charCodeAt.call(body, position);

      switch (code) {
        case 34:
          value += '"';
          break;
        case 47:
          value += '/';
          break;
        case 92:
          value += '\\';
          break;
        case 98:
          value += '\b';
          break;
        case 102:
          value += '\f';
          break;
        case 110:
          value += '\n';
          break;
        case 114:
          value += '\r';
          break;
        case 116:
          value += '\t';
          break;
        case 117: // u
          const charCode = uniCharCode(
            charCodeAt.call(body, position + 1),
            charCodeAt.call(body, position + 2), 
            charCodeAt.call(body, position + 3), 
            charCodeAt.call(body, position + 4)
          );

          if (charCode < 0) {
            throw syntaxError(
              source, 
              position, 
              'Invalid character escape sequence: ' + 
              "\\u".concat(body.slice(position + 1, position + 5), ".")
            );
          }

          value += String.fromCharCode(charCode);
          position += 4;
          break;

        default:
          throw syntaxError(
            source, 
            position, 
            `Invalid character escape sequence: \\${String.fromCharCode(code)}.`
          );
      }

      ++position;
      chunkStart = position;
    }
  }

  // unterminated string
  throw syntaxError(source, position, 'Unterminated string.');
}

/**
 * Reads a block string token from the source file.
 *
 * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
 */

function readBlockString(source, start, line, col, prev, lexer) {
  const body = source.body;
  let position = start + 3;
  let chunkStart = position;
  let code = 0;
  let rawValue = '';

  while (
    position < body.length && 
    (code = charCodeAt.call(body, position)) !== null
  ) {

    // Closing Triple-Quote (""")
    if (
      code === 34 && 
      charCodeAt.call(body, position + 1) === 34 && 
      charCodeAt.call(body, position + 2) === 34
    ) {
      rawValue += slice.call(body, chunkStart, position);

      return new Tok(
        TokenKind.BLOCK_STRING,
        start,
        position + 3,
        line,
        col,
        prev,
        blockStringValue(rawValue)
      );
    } 

    // SourceCharacter
    if (
      code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d
    ) {
      throw syntaxError(
        source, 
        position, 
        "Invalid character within String: ".concat(printCharCode(code), ".")
      );
    }

    if (code === 10) {
      // new line
      ++position;
      ++lexer.line;
      lexer.lineStart = position;
    } else if (code === 13) {
      // carriage return
      if (charCodeAt.call(body, position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }

      ++lexer.line;
      lexer.lineStart = position;
    } else if ( // Escape Triple-Quote (\""")
      code === 92 && 
      charCodeAt.call(body, position + 1) === 34 && 
      charCodeAt.call(body, position + 2) === 34 && 
      charCodeAt.call(body, position + 3) === 34
    ) {
      rawValue += slice.call(body, chunkStart, position) + '"""';
      position += 4;
      chunkStart = position;
    } else {
      ++position;
    }
  }

  throw syntaxError(source, position, 'Unterminated string.');
}

/**
 * Converts four hexadecimal chars to the integer that the string represents. 
 * For example, uniCharCode('0','0','0','f') will return 15, 
 * and uniCharCode('0','0','f','f') returns 255.
 *
 * Returns a negative number on error, if a char was invalid.
 *
 * This is implemented by noting that char2hex() returns -1 on error,
 * which means the result of ORing the char2hex() will also be negative.
 */

function uniCharCode(a, b, c, d) {
  return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
}

/**
 * Converts a hex character to its integer value.
 * '0' becomes 0, '9' becomes 9
 * 'A' becomes 10, 'F' becomes 15
 * 'a' becomes 10, 'f' becomes 15
 *
 * Returns -1 on error.
 */

function char2hex(a) {
  return a >= 48 && a <= 57 // 0-9
    ? a - 48 
    : a >= 65 && a <= 70    // A-F 
      ? a - 55 
      : a >= 97 && a <= 102 // a-f
        ? a - 87
        : -1;
}

/**
 * Reads an alphanumeric + underscore name from the source.
 *
 * [_A-Za-z][_0-9A-Za-z]*
 */

function readName(source, start, line, col, prev) {
  const body = source.body;
  let position = start + 1;
  let code = 0;

  while (
    position !== body.length && 
    (code = charCodeAt.call(body, position)) !== null && 
    (
    code === 95 || // _
    code >= 48 && code <= 57 || // 0-9
    code >= 65 && code <= 90 || // A-Z
    code >= 97 && code <= 122 // a-z
    ) 
  ) { ++position; }

  return new Tok(
    TokenKind.NAME, 
    start, 
    position, 
    line, 
    col, 
    prev, 
    slice.call(body, start, position)
  );
}
