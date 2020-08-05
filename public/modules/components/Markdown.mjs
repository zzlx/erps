/**
 * Markdown组件
 *
 * 解析markdown文本字符串,生成html文档
 *
 * @param {Object} opts
 * @return {} react element
 * @api public
 */

import markdown from '../utils/markdown.mjs';

export default function Markdown (props) {
  const { className, children, ...rests} = props;

  const cn = [
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', {
    className: cn,
    ...rests,
    dangerouslySetInnerHTML: { __html: markdown(children) },
  });
} 
