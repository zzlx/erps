/**
 * *****************************************************************************
 *
 * Modal
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Button from './Button.mjs';

export default function Modal(props) {
  const children = props.children;

  const cn_modal = ['modal'];
  cn_modal.push('fade');
  if (props.show) { cn_modal.push('show'); }

  const cn_dialog = ['modal-dialog'];

  if (props.scrollable) cn_dialog.push('modal-dialog-scrollable');
  if (props.centered) cn_dialog.push('modal-dialog-centered');

  const title  = React.createElement('h5', { 
    className: 'modal-title'
  }, props.title || 'Untitled');

  const span   = React.createElement('span', { 
    'aria-hidden': "true"
  }, 'x');

  const close  = React.createElement(Button, { 
    className: 'close', 
    'data-dismiss': "modal", 
    nostyle: 'true',
  }, span);

  const header = React.createElement('div', { 
    className: 'modal-header'
  }, title, close);

  const content= React.createElement('div', { 
    className: 'modal-content'
  }, header, children);

  const dialog = React.createElement('div', { 
    className: cn_dialog.join(' '), 
    role: 'document'
  }, content);

  const modal = React.createElement('div', { 
    className: cn_modal.join(' '), 
    tabIndex: '-1', 
    role: 'dialog' 
  }, dialog);

  return modal;
}
