/**
 * Container component
 *
 * @param {bool} props.fluid
 * @param {string} props.breakpoint
 * @return {obj} React element
 * @api public
 * @file Container.mjs
 * *****************************************************************************
 */

import React from 'react';

export default function Container (props) {
  const { breakpoint, fluid, className, ...rests } = props;

  const cn = [
    !fluid ? 'container' : null,
    fluid ?'container-fluid' : null,
    breakpoint ? 'container-' + breakpoint : null,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
