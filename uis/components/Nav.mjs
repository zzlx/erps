/**
 * *****************************************************************************
 *
 * Nav Component
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import { eventHandler } from '../actions/eventHandler.mjs'; 

export default function Nav (props) {
  const {
    data, pills, fill, justified, tabs, position,
    className, children, ...rests
  } = props;

  if (data == null) return null;

  const items = data.map((item, i) => React.createElement('li', { 
    key: i,
    className: 'nav-item'
  }, React.createElement('a', {
    className: [
      'nav-link', 
      item.disabled && 'disabled',
      item.active && 'active',
    ].filter(Boolean).join(' '),
    href: item.href,
    disabled: item.disabled,
    onClick: eventHandler,
  }, item.text)));

  const cn_nav = [
    'nav',
    pills && !tabs && 'nav-pills',
    fill && 'nav-fill',
    tabs && 'nav-tabs',
    justified && 'nav-justified',
    position === 'center' && 'justify-content-center',
    position === 'right' && 'justify-content-end',
    position === 'vertical' && 'flex-column',
    className
  ].filter(Boolean).join(' ');

  return React.createElement('ul', { className: cn_nav }, items);
}
