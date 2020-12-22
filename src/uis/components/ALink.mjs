/**
 * *****************************************************************************
 *
 * Anchor Link component
 *
 * 超链接组件特性: 
 * 阻止刷新页面，由事件处理器负责管理页面
 *
 * *****************************************************************************
 */

import React from './_React.mjs';
import Context from './_Context.mjs';

export default class AnchorLink extends React.PureComponent {
  render() {
    const { active, disabled, onClick, className, ...rests } = this.props;

    const cn = [
      disabled && !active && 'disabled',
      active && !disabled && 'active',
      className,
    ].filter(Boolean).join(' ');

    return React.createElement('a', { 
      className: cn : null,
      tabIndex: disabled ? "-1" : null,
      "aria-disabled": disabled ? "true" : null,
      disabled: disabled ? true : null,
      onClick: e => { e.preventDefaults(); onClick(e) },
      ...rests 
    });
  }
}

AnchorLink.contextType = Context;
