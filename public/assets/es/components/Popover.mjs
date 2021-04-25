/**
 * Popover 
 */

import { React } from './React.mjs';
export function Popover (props) {
  const {type, children, onClick} = props;

  return React.createElement('button', {
    type: "button",
    className: `btn btn-${type}`,
  });
}
