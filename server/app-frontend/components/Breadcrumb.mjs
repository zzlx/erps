/**
 * *****************************************************************************
 *
 * Breadcrumb
 * 
 * 面包屑导航
 *
 * Indicate the current page’s location within a navigational hierarchy 
 * that automatically adds separators via CSS.
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Breadcrumb(props) {

  const { data, children, ...rests } = props;

  const items = [];

  data && data.map((v, i) => {
    const isLast = i === (data.length-1);
    let Item = React.createElement('li', {
      key: i,
      className: `breadcrumb-item${isLast ? ' active': ''}`,
      'aria-current': isLast ? "page" : null,
    }, v.url && !isLast ? React.createElement('a', {href: v.url}, v.item): v.item);
    items.push(Item); 
  }); 

  const List = React.createElement('ol', { 
    className: 'breadcrumb' 
  }, children, items);

  return React.createElement('nav', {
    'aria-label': 'breadcrumb',
    ...rests,
  }, List);
}
