/**
 * Scrollspy 
 *
 * 用于导航栏跟随滚动状态
 *
 */

import React from './React.mjs';
export default function Scrollspy(props) {
  const { offset, target, ...rests } = props;

  return React.createElement('div', {
    'data-spy': "scroll",
    "data-target": target,
    "data-offset": offset,
    onScroll: scrollHandler,
    className: 'position-relative overflow-y-auto',
    ...rests
  });
}


/**
 * 页面滚动管理器
 */
function scrollHandler(event) {
  const target = event.target.dataset['target'];
  const offset = event.target.dataset['offset'];

  const scrollRect = event.target.getBoundingClientRect();
  const scrollTop  = event.target.scrollTop;
  const scrollHeight = event.target.scrollHeight;

  const selector = `${target} .nav-link,` +
                   `${target} .list-group-item,` +
                   `${target} .dropdown-item`;

  const targets = document.querySelectorAll(selector);

  targets.map(el => {
    if (el.hash) {
      let point = event.target.querySelector(el.hash);
      if (!point) return;

      let pointRect = point.getBoundingClientRect();

      if (scrollRect.top > pointRect.top && scrollRect.top < pointRect.bottom) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });
}
