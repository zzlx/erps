/**
 * *****************************************************************************
 *
 * Carousel component
 *
 * 轮播(走马灯)组件,用于播放幻灯片放映效果
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Carousel (props) {

  const {
    data, touch, interval,
    className,
    ...rests
  } = props;

  const activeRef = React.useRef(null);

  // @todo: 增加动画切换效果
  const [id, setId] = React.useState(0);

  const prevButton = React.createElement('button', {
    className: 'carousel-control-prev',
    type: 'button',
    'data-bs-slid': "prev",
    onClick: eventHandler,
  }, 
    React.createElement('span', { className: "carousel-control-prev-icon" }),
    React.createElement('span', { className: "visually-hidden" }, 'Previous'),
  );

  const nextButton = React.createElement('button', {
    className: 'carousel-control-next',
    type: 'button',
    'data-bs-slid': 'next',
    onClick: eventHandler,
  }, 
    React.createElement('span', { className: "carousel-control-next-icon" }),
    React.createElement('span', { className: "visually-hidden" }, 'Next'),
  );

  const indicators = React.createElement('div', { 
    className: 'carousel-indicators'
  }, data.map((v,k) => React.createElement('button', {
    key: k,
    type: "button",
    'data-bs-target': '#',
    'data-bs-slid-to': k,
    className: k === id ? 'active' : null, 
    onClick: eventHandler,
  })));


  const inner = React.createElement('div', { 
    className: 'carousel-inner'
  }, data.map((v,k) => React.createElement('div', {
    key: k,
    className: `carousel-item${k === id ? ' active' : ''}`, 
  }, React.createElement('img', Object.assign({}, v, { 
    className: `d-block w-100 h-100`, 
  })))));

  return React.createElement('div', {
    className: [ 
      'carousel', 
      'carousel-dark',
      'slide', 
      className
    ].filter(Boolean).join(' '),
    ...rests,
  }, 
    inner, // 
    prevButton, nextButton, // 左右按钮
    indicators, // 指示器
  );

  // event handler

  function eventHandler (e) {
    const b = e.currentTarget;

    // 处理组件操作
    if (b.dataset && b.dataset.bsSlid) {
      let next;

      if (b.dataset.bsSlid === 'next') next = id + 1; 
      else if (b.dataset.bsSlid === 'prev') next = id - 1; 

      if (next < 0) next = data.length - 1;
      else if (next >= data.length) next = 0;

      setId(next);
    }

    if (b.dataset && b.dataset.bsSlidTo) {
      const to = Number(b.dataset.bsSlidTo);
      setId(to);
    }
  }
}
