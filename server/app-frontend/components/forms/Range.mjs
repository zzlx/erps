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
    children,
    className,
    ...rests
  } = Object.assign({}, {
    defaultValue: "0",
    min: "0",
    max: "100",
    step: "1",
  }, props);

  return React.createElement('div', {
    className: [
      "grid",
      className
    ].filter(Boolean).join(' '),
  }, children,
    React.createElement('input', { 
      type: 'range', 
      className: 'form-range g-col-11', 
      onChange: eventHandler,
      onKeyDown: eventHandler,
      ...rests
    }),
    React.createElement('label', { 
      className: 'form-label g-col-1', 
      children: rests.defaultValue
    }),
  );
}
