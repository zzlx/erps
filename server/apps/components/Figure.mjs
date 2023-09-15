/**
 * *****************************************************************************
 *
 * Figure component
 *
 * for displaying related images and text 
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Figure (props) {
  const { 
    className, 
    src,
    caption,
    ...rests 
  } = props;

  const cn = [
    'figure',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('figure', { 
    className: cn, 
    ...rests 
  }, React.createElement('img', {
    src: src,
    className: "figure-img img-fluid rounded",
  }), React.createElement('figcaption', {
    className: "figure-caption text-center"
  }, caption));
} 

