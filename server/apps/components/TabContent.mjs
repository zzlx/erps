/**
 * *****************************************************************************
 *
 * Tab Content
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function TabContent (props) {
  const { className, children, ...rests } = props;

  // 设置className
  const cn = ['tab-content'];
  if (className) cn.push(className);

  // apply tab-pane className to children
  const newChildren = React.Children.map(children, (child, i) => {
    const cn = [
      'tab-pane', 
      i === 0 && 'show active',
      child.className
    ].filter(Boolean).join(' ');
    return React.cloneElement(child, {className: cn});
  });

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests 
  }, newChildren);
}
