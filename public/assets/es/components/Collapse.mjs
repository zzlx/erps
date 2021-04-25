/**
 * *****************************************************************************
 *
 * Collapse
 *
 * 折叠组件
 *
 * *****************************************************************************
 */

import { React } from './React.mjs';

export function Collapse (props) {
  const { className, ...rests} = props;

  const cn = [
    'collapse',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests, });
}
