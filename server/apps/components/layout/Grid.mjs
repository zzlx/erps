/**
 * *****************************************************************************
 *
 * Container component
 *
 * 提供一个容器组件
 *
 * @param {bool} props.fluid
 * @param {string} props.breakpoint
 * @return {obj} React element
 * @api public
 *
 * *****************************************************************************
 */

import React from '../React.mjs';

export default function Grid (props) {
  const { col, gap, className, ...rests } = props;

  const cn = [
    'grid',
    className,
  ].filter(Boolean).join(' ');

  const style = {}
  if (col) style['--bs-columns'] = col;
  if (gap) style['--bs-gap'] = gap;

  return React.createElement('div', { 
    className: cn, 
    style,
    ...rests 
  });
}
