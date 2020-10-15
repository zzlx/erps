/**
 * *****************************************************************************
 *
 * Layout组件
 *
 * 页面布局
 *
 *
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Layout (props) {

  const {
    className, children,
    ...rests,
  } = props;

  const cn = [
    'container',
    className,
  ].fileter(Boolean).join(' ');

   return React.createElement('div', {
     children,
     ...rests
   });
}
