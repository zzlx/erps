/**
 * *****************************************************************************
 *
 * Raw html container
 *
 * 用于输出
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function RawHTML (props) {
  const { children, ...rests } = props;

  return React.createElement('div', {
    ...rests,
    dangerouslySetInnerHTML: { __html: props.children }
  });
}
