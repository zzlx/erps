/**
 * *****************************************************************************
 *  
 *  为Element添加className
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default function addClassNameForElement (element, className) {
  if (!React.isValidElement(element)) throw new TypeError('This Element is invalid.');

  const cn = [ 
    element.props.className, 
    className,
  ].filter(Boolean).join(' ');

  return React.cloneElement(element, { 
    className: cn, 
  });
}
