/**
 *
 *
 *
 *
 */

import React from 'react';

export default function RowSection (props) {
  const { className, children, ...rests } = props;
  const cn = [];
  if (className) cn.push(className);

  return React.createElement('div', {
    className: cn.join(' '),
    ...rests,
  }, children);
}
