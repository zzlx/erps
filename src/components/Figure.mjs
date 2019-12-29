/**
 * Figure component
 *
 * for displaying related images and text 
 *
 */

import React from 'react';

export default function Figure (props) {
  const { className, ...rests } = props;
  const cn = [
    'figure',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('figure', { className: cn, ...rests });
} 
