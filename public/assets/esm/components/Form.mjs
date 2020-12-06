/**
 * *****************************************************************************
 *
 * Form Component
 *
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default function Form (props) {
  const { 
    inline, 
    className, 
    ...rests 
  } = props;

  const cn = [
    inline && 'form-inline',
    className,
  ].filter(Boolean).join(' ');


  return React.createElement('form', {
    className: cn,
    ...rests,
  });
}

export function FormGroup (props) {
  const { className, ...rests } = props;

  const cn = ['form-group', className].filter(Boolean).join(' ');

  return React.createElement('div', {
    className: cn,
    ...rests,
  });

}

export function InputGroup () {
}
