/**
 * *****************************************************************************
 *
 * Dropdown component
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Dropdown (props) {
  const { directions, split, className, children, ...rests } = props;
  
  const cn = ['dropdown'];
  if (className) cn.push(className);

  let type = 'div';

  if (React.isValidElement(children)) {
    type = children;
    if (children.props.className) {
      cn.push(children.props.className);
    }
  }

  return React.createElement(type, {
    className: cn.join(' '),
    ...rests
  });
}
