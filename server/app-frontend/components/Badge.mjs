/**
 * *****************************************************************************
 *
 * Badge
 *
 * 徽章组件
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Badge (props) {
  const { 
    theme, 
    pill, 
    className, ...rests 
  } = props;

  const cn = [
    'badge',
    pill && 'badge-pill',
    theme && `badge-${theme}`,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('sup', { className: cn, ...rests }); 
}

// @Test
//console.log(Badge({}));
