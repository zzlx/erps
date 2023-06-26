/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import React from '../React.mjs';

export default function Select (props) {
  const { size, className, options, children, ...rests } = props;

  return React.createElement('select', {
    className: [ 
      'form-select',
      size ? `form-select-${size}` : false,
      className
    ].filter(Boolean).join(' '), 
    ...rests,
  }, children, options && Array.isArray(options) ? options.map((v, k) => {

    const isObjectOpt = typeof v === 'object';
    const value = isObjectOpt ? v.value : v;
    const text = isObjectOpt ? v.text : v;

    return React.createElement('option', { value: value, key: k }, text)
  }) : null
  );
}
