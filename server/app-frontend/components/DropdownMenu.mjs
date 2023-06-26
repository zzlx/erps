/**
 * *****************************************************************************
 *
 * Dropdown Menu
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function DropdownMenu (props) {
  const { className, children, ...rests } = props;

  const cn = ['dropdown-menu'];
  if (className) cn.push(className);

  const newChildren = React.Children(children, child => {
    const cn = [ 'dropdown-item' ];
    if (child.props.className) cn.push(child.props.className);
    return React.clone(child, {className: cn.join(' ')});
  });

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests 
  }, newChildren);
}
