/**
 * *****************************************************************************
 *
 * Circular component
 *
 * 圆形组件
 *
 * 接受参数，生产svg圆形图形
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function Circular (props) {
  const { 
    size,
    className, ...rests 
  } = props;

  const sizes = size ? Number(size) : 160;

  const cn = [
    className,
  ].filter(Boolean).join(' ');

  const circle = React.createElement('circle', {
    cx: sizes/2,
    cy: sizes/2,
    r: sizes/2,
    //stroke: "black",
    //strokeWidth: "2",
    fill: "#006092",
  });

  const text = React.createElement('text', {
    x: "35%",
    y: "50%",
    dy: "0.3em"
  }, `${sizes}x${sizes}`);

  return React.createElement('svg', { 
    xmlns: "http://www.w3.org/2000/svg",
    className: cn, 
    width: sizes,
    height: sizes,
    role: "img",
    ...rests 
  }, circle, text);
}
