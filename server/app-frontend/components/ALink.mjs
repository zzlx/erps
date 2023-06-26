/**
 * *****************************************************************************
 *
 * Anchor Link component
 *
 * 超链接组件特性: 
 * 阻止刷新页面，由事件处理器负责管理页面
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function ALink (props) {
  const { 
    onClick, className, 
    text,
    width, height,
    src, alt,
    subMenu, // 解决navbar组件subMenu显示数据的bug
    disabled,
    ...rests 
  } = props;

  const [active, setActive] = React.useState(false);

  const img = src ? React.createElement('img', { 
    src, 
    alt, 
    width,
    height,
    className: "d-inline-block text-align-top me-2"
  }) : null;

  const textWrapper = src ? React.createElement('span', {
    className: '',
  }, text) : text;

  return React.createElement('a', { 
    className: [
      disabled ? 'disabled' : null,
      active == true ? 'active' : null,
      className,
    ].filter(Boolean).join(' '),
    tabIndex: disabled ? "-1" : null,
    disabled: disabled,
    onClick: e => { 
      e.preventDefault();       // 阻止默认行为,主要是阻止页面刷新行为
      if (onClick) onClick(e);  // 执行绑定的click事件处理器
      if (disabled == null) return;
    },
    ...rests
  }, img, textWrapper);
}
