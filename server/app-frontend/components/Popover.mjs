/**
 * *****************************************************************************
 *
 * Popover 
 * 弹出式窗口
 *
 * *****************************************************************************
 */

import React from './React.mjs';
export default function Popover (props) {

  const {type, children, onClick} = props;

  return React.createElement('button', {
    type: "button",
    className: `btn btn-${type}`,
  });
}
