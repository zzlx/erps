/**
 * *****************************************************************************
 *
 * Anchor component
 *
 * @file AnchorLink.mjs
 * *****************************************************************************
 */

import React from 'react';

export default function AnchorLink (props) {
  const { active, disabled, src, onClick, className, ...rests } = props;

  const cn = [];
  if (disabled && !active) cn.push('disabled');
  if (active && !disabled) cn.push('active');
  if (className) cn.push(className);

  return React.createElement('a', { 
    className: cn.length ? cn.join(' ') : null,
    tabIndex: disabled ? "-1" : null,
    "aria-disabled": disabled ? "true" : null,
    disabled: disabled ? true : null,
    ...rests 
  });
}
