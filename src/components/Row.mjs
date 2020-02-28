/**
 * *****************************************************************************
 *
 * 行组件
 *
 * @file Row.mjs
 * *****************************************************************************
 */

import React from 'react';

export default function Row (props) {
  const { className, children, ...rests } = props;

  const cn_row = [
    'row',
    className,
  ].filter(Boolean).join(' ');


  return React.createElement('div', {
    className: cn_row,
    ...rests,
  }, children);
}
