/**
 * *****************************************************************************
 *
 * Anchor link component
 *
 * 超链接组件特性: 
 * 阻止刷新页面，由事件处理器负责管理页面
 *
 * *****************************************************************************
 */

export default function AnchorLink (props) {
  const { active, disabled, src, onClick, className, ...rests } = props;

  const cn = [
    disabled && !active && 'disabled',
    active && !disabled && 'active',
    className,
  ].filter(Boolean);

  return React.createElement('a', { 
    className: cn.length ? cn.join(' ') : null,
    tabIndex: disabled ? "-1" : null,
    "aria-disabled": disabled ? "true" : null,
    disabled: disabled ? true : null,
    onClick: handleClick,
    ...rests 
  });
}

function handleClick (e) {
  e.preventDefaults();
}
