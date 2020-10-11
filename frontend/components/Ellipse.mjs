/**
 * *****************************************************************************
 *
 * Ellipse
 * 圆形组件
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Ellipse (props) {
  const { data, fill, stroke, strokeWidth, cx, ...rests } = props;

  const ellipse = React.createElement('ellipse', {
    ...rests,
    fill: fill || 'snow',
    stroke: stroke || 'red',
    strokeWidth: strokeWidth || '1',
    cx: cx || '50',
    cy: cx || '50',
    rx: cx || '50',
    ry: cx || '50',
  });

  return React.createElement('svg', {
    version: "1.1",
    width: "100%",
    height: "100%",
    xmlns: "http://www.w3.org/2000/svg",
  }, ellipse);
}
