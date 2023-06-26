/**
 * *****************************************************************************
 *
 * Embed Component
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Embed(props) {
  const {aspectRatios, className, children, ...rests} = props;

  const cn = ['embed-responsive'];
  if (aspectRatios) {
    cn.push(`embed-responsive-${aspectRatios}`);
  } else {
    cn.push(`embed-responsive-16by9`);
  }

  if (className) cn.push(className);

  let newChildren = [];

  React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      const cn = ['embed-responsive-item'];
      if (child.props.className) cn.push(child.props.className);
      const newChild = React.cloneElement(child, {
        className: cn.join(' '),
      })
      newChildren.push(newChild);
    }
  });

  return React.createElement('div', {
    className: cn.join(' '),
    ...rests,
  }, newChildren);
}
