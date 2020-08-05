/**
 * *****************************************************************************
 *
 * Markdown 
 *
 * 解析markdown字串, 生成JSON\html格式文档
 *
 *
 * @todos: 
 * 实现pdf格式文档
 * 生成canvas图形
 *
 * 用法:
 *
 * ```
 * const html = markdown('### test'); // output html format <h3></h3>
 *
 * // output json format '[{"tag": "h3", "content": "test"}]'
 * const json = markdown('### test', {format: 'json'}); 
 * ```
 *
 * *****************************************************************************
 */

/**
 *
 * @param {string} source
 * @param {string|object} options
 */

export default function markdown (source, options, callback) {
  const md = new Markdown(source, options);

  return source;
}

/**
 * Markdown processor
 */

class Markdown {
  constructor(source, options) {
    this.opts = Object.assign({}, {
      format: ['json', 'html', 'xml', 'pdf'][1],
    }, options); 

    this.contentData = []; // 存储解析后的数据

  }

  toJSON () {
    return this.contentData;
  }

  /**
   * output html string
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

  toHTML () {
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
}

/**
 * 词法解析
 */

class Lexer {

} 
