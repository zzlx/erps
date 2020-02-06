/**
 * 占位行组件
 *
 * 用于在输出内容前输出占位行
 *
 * @param {number} props.row 占位行数
 * @return {object} react valid element.
 * @api public
 * @file Placeholder.mjs
 * *****************************************************************************
 */

import React from 'react';
import randomInt from '../utils/randomInt.mjs';

export default function Placeholder(props) {
  const { className, row, children, ...rests } = props;
  const cn = ['placeholder', className ].filter(Boolean).join(' ');
  const sizes = ['xsmall', 'small', 'medium', 'large', 'full'];
  const Ps = []; // 占位行列表

  // 生成占位行
  for (let i = 0; i < (row ? Number.parseInt(row) : 15); i++) {
    const index = randomInt(0, sizes.length-1);
    const row = React.createElement('p', {
      key: i,
      className: 'placeholder_' + sizes[index] + ' rainbow',
    }, '\xA0'); 

    Ps.push(row);
  }

  return React.createElement('div', { className: cn, ...rests, }, children, Ps);
}
