/**
 * Modal组件
 *
 */

import Button from './Button.mjs';
const _ = React.createElement;

export default function Modal(props) {
  const children = props.children;

  const cn_modal = ['modal'];
  cn_modal.push('fade');
  if (props.show) { cn_modal.push('show'); }

  const cn_dialog = ['modal-dialog'];
  if (props.scrollable) cn_dialog.push('modal-dialog-scrollable');
  if (props.centered) cn_dialog.push('modal-dialog-centered');

  const title  = _('h5',  { className: 'modal-title'}, props.title || 'Untitled');
  const span   = _('span', { 'aria-hidden': "true"}, 'x');
  const close  = _(Button, { 
    className: 'close', 
    'data-dismiss': "modal", 
    nostyle: 'true',
  }, span);

  const header = _('div', { className: 'modal-header'}, title, close);
  const content= _('div', { className: 'modal-content'}, header, children);
  const dialog = _('div', { 
    className: cn_dialog.join(' '), 
    role: 'document'
  }, content);

  const modal = _('div', { 
    className: cn_modal.join(' '), 
    tabIndex: '-1', 
    role: 'dialog' 
  }, dialog);

  return modal;
}
