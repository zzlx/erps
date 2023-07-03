/**
 * *****************************************************************************
 *
 * Blockquote 
 *
 * 块引用组件
 *
 * *****************************************************************************
 */

import React from './React.mjs';

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
    if (child.type === 'footer') {
      return React.cloneElement(child, { 
        className: [
          'blockquote-footer', 
          child.props.className
        ].filter(Boolean).join(' ')
      });
    }

    return child;
  });

  return React.createElement('blockquote', {
    className: cn_blockquote,
    ...rests,
  }, newChildren);
}
