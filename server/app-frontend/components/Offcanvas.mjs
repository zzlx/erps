/**
 * *****************************************************************************
 *
 * Offcanvas component
 *
 * build offcanvas component with React
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import { eventHandler } from '../actions/eventHandler.mjs'; 

export default function Officecanvas (props) {
  const { title, placement, className, children, ...rest } = props;

  const t  = React.createElement('h5', { className: 'offcanvas-title' }, title);
  const b  = React.createElement('button', { 
    className: 'btn-close', 
    type: 'button', 
    'data-bs-dismiss': "offcanvas",
    onClick: eventHandler,
  });

  const header = React.createElement('div', {
    className: 'offcanvas-header',
  }, t, b);
  const body = React.createElement('div', {
    className: 'offcanvas-body',
  }, children);

  return React.createElement('div', {
    className: [
      'offcanvas',
      `offcanvas-${['start', 'end', 'top', 'bottom'].includes(placement) 
          ? placement 
          : 'bottom'
      }`,
      className,
    ].filter(Boolean).join(' '),
    tabIndex: "-1",
    ...rest
  }, header, body);
}
