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

export default function Container (props) {
  const breakpoints = ['sm', 'md', 'lg', 'xl'];
  const { breakpoint, fluid, className, ...rests } = props;

  const cn = [
    !fluid && 'container',
    fluid && 'container-fluid',
    breakpoint && breakpoints.include(breakpoint) && !fluid && 'container-' + bp,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
