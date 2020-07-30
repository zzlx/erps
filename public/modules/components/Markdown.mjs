/**
 * Markdown组件
 *
 * 解析markdown文本字符串,生成html文档
 *
 * @param {Object} opts
 * @return {} react element
 * @api public
 */

import Markable from 'remarkable';

export default function Markdown (opts = {}) {
  const markdown = new Markable('commonmark');
  const $$typeof = Symbol.for('react.element');
  let type = 'div';
  let props = opts;

  if (opts.$$typeof === $$typeof) {
    type = opts.type
    props = opts.props;
  }

  const { calssName, children, ...rests} = props;
  const cn = ['markdown', className].filter(Boolean);

  return React.createElement(type, {
    className: cn.join(' '),
    ...rests,
    dangerouslySetInnerHTML: {__html: markdown.render(children)},
  });
} 
