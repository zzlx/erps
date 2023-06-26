/**
 * *****************************************************************************
 *
 * Jumbotron
 *
 * 大屏幕组件
 * A lightweight, flexible component for showcasing hero unit style content.
 *
 * @param {obj} props
 * @return {obj} React element
 * @api public
 *
 * *****************************************************************************
 */

import React from './React.mjs';

const breakpoints = ['sm', 'md', 'lg', 'xl'];

export default function Jumbotron (props) {
  const { fluid, className, ...rests } = props;

  // 根据props属性构造className
  const cn = [
    'jumbotron',
    fluid ? 'jumbotron-fluid' : null,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
