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

import { React } from './React.mjs';
import { Context } from './Context.mjs';

export class ALink extends React.PureComponent {
  render() {
    const { active, disabled, onClick, className, ...rests } = this.props;

    const cn = [
      disabled && !active && 'disabled',
      active && !disabled && 'active',
      className,
    ].filter(Boolean).join(' ');

    return React.createElement('a', { 
      className: cn,
      tabIndex: disabled ? "-1" : null,
      "aria-disabled": disabled ? "true" : null,
      disabled: disabled ? true : null,
      onClick: e => { e.preventDefaults(); onClick(e) },
      ...rests 
    });
  }
}

ALink.contextType = Context;
