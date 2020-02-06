/**
 * Container组件
 *
 */

import React from 'react';

export default function Container (props) {
  const { fluid, className, ...rests } = props;

  const cn = [
    !fluid && 'container',
    fluid && 'container-fluid',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
