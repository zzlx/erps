/**
 * *****************************************************************************
 *
 * 滚动加载
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function ScrollLoad(props) {
  const { offset, target, ...rests } = props;

  return React.createElement('div', {
    'data-spy': "scroll",
    "data-target": target,
    "data-offset": offset,
    onScroll: scrollHandler,
    className: 'position-relative overflow-y-auto', ...rests
  });
}

function load () {
  window.addEventListener('scroll', function() {
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    if (clientHeight + scrollTop >= scrollHeight) {
      // 检测到滚动至页面底部，进行后续操作
      // ...
    }
  }, false);
}
