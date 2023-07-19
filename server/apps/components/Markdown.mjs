/**
 * *****************************************************************************
 *
 * Markdown
 *
 * 解析markdown字符串生成element
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Markdown (props) {
  const {
    text,
    ...rests,
  } = props;

  return React.createElement(React.Fragment, null, '');
}
