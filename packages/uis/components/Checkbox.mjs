/**
 * *****************************************************************************
 *
 * Checkbox
 *
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Checkbox (props) {

  const id = React.useId(); // globally unique id

  return React.createElement(React.Fragment, null,
    props.lable ? React.createElement('label', { htmlFor: id }, props.label) : null,
    React.createElement('input', { 
      type: "checkbox", 
      name: props.name,
      id: id 
    })
  );
}
