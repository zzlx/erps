/**
 * *****************************************************************************
 *
 * Blockquote 
 *
 * 块引用组件
 *
 * *****************************************************************************
 */

import React from './_React.mjs';
import addClassName from './_classNames.mjs';

export default function Blockquote(props = {}) {
  const { theme, className, children, ...rests } = props;

  // blockquote className
  const cn_blockquote = [
    className,
    'blockquote',
    `blockquote-${theme ? theme : 'primary'}`,
  ].filter(Boolean).join(' ');

  // blockquote-footer className
  const newChildren = React.Children.map(children, child => {
    if (child.type === 'footer') return addClassName(child, 'blockquote-footer');
    return child;
  });

  return React.createElement('blockquote', {
    className: cn_blockquote,
    ...rests,
  }, newChildren);
}
