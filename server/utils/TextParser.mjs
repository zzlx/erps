/**
 * *****************************************************************************
 * 
 * 文本字符解析器
 *
 *
 * *****************************************************************************
 */

const ValueRegExp = new RegExp(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/, 'g');

export default class TextParser {
  constructor (str) {
    this.str = str ? str : '';
    this.values = [];
    this.process(); // 处理字符串
  }

  /**
   * parser
   *
   * @param {string} csv string
   * @returns {result}
   *
   */

  parser (csv) {
    const result = [];
    let match = null;

    while((match = ValueRegExp.exec(csv)) !== null) {
      if (undefined !== match[1]) { result.push(match[1].trim()); continue; }
      if (undefined !== match[2]) { result.push(match[2].trim()); continue; }
      if (undefined !== match[3]) { result.push(match[3].trim()); continue; }
      result.push(''); // 空值
    }

    return result.length ? result : null;
  }

  /**
   * 处理字符串
   */

  process () {
    const lines = this.str.split(/\r\n|\n/);

    for (let line of lines) {
      const values = this.parser(line);
      if (!values) continue;

      this.values.push(values);
    }
  }
}
