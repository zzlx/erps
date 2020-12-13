/**
 * *****************************************************************************
 *
 * Accordion
 *
 * 手风琴效果组件
 *
 * @param {object} props
 * @param {boolean} props.flush
 * @return {object} element
 * *****************************************************************************
 */

import React from './_React.mjs';

export default function Accordion (props) {
  const { flush, className, children, ...rests } = props;

  const cn = [
    "accordion",
    flush && "accordion-flush",
    className,
  ].filter(Boolean).join(' ');

  const newChildren = React.Children.map(children, child => {
    const cn = [
      'accordion-item',
      child.props.className,
    ].filter(Boolean).join(' ');

    return React.cloneElement(child, { className: cn });
  });

  return React.createElement('div', { 
    className: cn,
    ...rests 
  }, newChildren);
}
