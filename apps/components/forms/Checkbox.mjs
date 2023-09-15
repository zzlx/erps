/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import React from '../React.mjs';
import { eventHandler } from '../../actions/eventHandler.mjs';

export default function Checkbox (props) {
  const { 
    checked,
    type, reverse, inline, switcher, label, className, children, ...rests 
  } = props;

  const _type = "radio" == type ? 'radio' : "checkbox";

  return React.createElement('div', {
    className: [
      'form-check', 
      inline ? 'form-check-inline' : null,
      reverse ? 'form-check-reverse' : null,
      switcher ? 'form-switch' : null,
      className
    ].filter(Boolean).join(' '),
  }, children,
    React.createElement('input', { 
      className: 'form-check-input', 
      type: _type, 
      role: switcher ? 'switch' : _type,
      onChange: eventHandler,
      onKeyDown: eventHandler,
      //onKeyUp: eventHandler,
      //onKeyPress: eventHandler, // 
      defaultChecked: checked ? true : false,
      ...rests
    }),
    label ? React.createElement('label', { 
      className: 'form-check-label', 
      children: label
    }) : null,
  );
}
