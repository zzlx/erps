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

export default function Col (props) {
  const { col, className, ...rests } = props;

  const cn = [
    col && `g-col-${col}`,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
