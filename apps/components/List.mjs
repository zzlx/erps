/**
 * *****************************************************************************
 *
 * List component
 *
 * @return {} react element
 * @api public
 * *****************************************************************************
 */

import React from './React.mjs';

export default function List (props) {
  const {
    action, disabled, row, flush,
    onClick, onKeyDown, withBadge,
    className, children, ...rests 
  } = props;

  // 构建list-group
  const cn = ['list-group'];
  if (flush) cn.push('list-group-flush');
  if (className) cn.push(className);

  // 构建list-group-item
  const itemClass = ['list-group-item'];
  const act = action || true;
  if (act) itemClass.push('list-group-item-action');
  if (disabled) itemClass.push('disabled');
  if (withBadge) itemClass.push('d-flex justify-content-between align-items-center');


  const newChildren = [];
  let i = 0;

  for (let child of children) {
    const cn = itemClass;
    if (child.props.className) cn.push(child.props);
    const newChild = React.cloneElement(child, {
      key: i++,
      className: cn.join(' '),
      onClick: actions,
      onKeyDown: actions,
      tabIndex: -1,
    });

    newChildren.push(newChild);
  }

  return React.createElement('ul', {
    className: cn.join(' '),
    tabIndex: 0,
    ...rests,
  }, newChildren);
}

/**
 *
 *
 */
function actions (e) {
  const list = e.target.parentNode;

  if (e.type === 'click') {
    const items = list.children;
    for (let i = 0; i < items.length; i++) {
      items.item(i).classList.remove('active')
    }

    let now = e.target;
    now.classList.add('active');
    now.focus();
    return;
  }

  e.preventDefault();
  let now = e.target;
  let next = null;

  // Enter
  if (/Enter/.test(e.key)) {
    if (now === list) return null;
    e.preventDefault();
    now.click();
  } 

  // Next
  if (/ArrowRight|ArrowDown/.test(e.key) || (/Tab/.test(e.key) && !e.shiftKey)) {
    if (now === list) { // 如果焦点位于container, 默认选中第1个
      now = list.firstChild;
      now.classList.add('active');
      now.focus();
      return;
    }
    next = now.nextSibling;
  }

  // Prev
  if (/ArrowLeft|ArrowUp/.test(e.key) || (/Tab/.test(e.key) && e.shiftKey)) {
    next = now.previousSibling;
  }

  if (!next) return;
  now.classList.remove('active');
  next.classList.add('active');
  next.focus();
}
