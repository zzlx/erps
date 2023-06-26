/**
 * *****************************************************************************
 *
 * 条形码组件
 *
 * 1. 支持svg/canvas等格式;
 * 2. 支持导出png/jpeg/ico等常用图片格式
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import { barcode } from '../utils/barcode.mjs';

export default class Barcode extends React.PureComponent { 
  constructor(props) {
    super(props);
    this._ref = React.createRef();
  }

  componentDidMount() {
    const canvas = this._ref.current;
    const draw = new Drawer(canvas);
    draw.fillStyle('snow')
        .fillRect(0,0,100, 100)
        .fillStyle('red')
        .arc(50, 50, 30); // 圆形位于正中心 半径为相对x的比例

  }

  render() {
    const { width, height, ...rests } = this.props;

    return React.createElement('canvas', {
      width: width ? width : '150',
      height: height ? height : '100',
      ref: this._ref,
      ...rests
    }, '如无法正常显示canvas,请升级客户端浏览器至最新版本.');
  }
}

export class Drawer {
  constructor(element) {
      this.ctx = element.getContext('2d');
      const rect = element.getBoundingClientRect();

      // 构造坐标系
      this.x = rect.width; 
      this.y = rect.width; 
      this.scaleX = this.x / 100;
      this.scaleY = this.y / 100;
  }

  // 属性
  fillStyle (color = 'black') {
    this.ctx.fillStyle = color;
    return this;
  }

  get strokeStyle () {
    return this.ctx.strokeStyle;
  }

  set fillStyle (color = 'black') {
    this.ctx.strokeStyle = color;
    return this;
  }

  get shadowColor () {
    return this.ctx.shadowColor;
  }

  set shadowColor (color = 'black') {
    this.ctx.shadowColor = color;
    return this;
  }

  set shadowBlur (color = 'black') {
    this.ctx.shadowBlur = color;
    return this;
  }

  set shadowOffsetX (color = 'black') {
    this.ctx.shadowOffsetX = color;
    return this;
  }

  set shadowOffsetY (color = 'black') {
    this.ctx.shadowOffsetY = color;
    return this;
  }

  // 创建线性渐变
  createLinearGradient(x, y, x1, y1) {
    return this;
  }

  // 创建放射性渐变
  createRadialGradient(x, y, r, x1, y1, r1) {
    return this;
  }

  setLineDash (x,y,x1,y1, dash = [20, 5],offset = 0) {
    this.ctx.setLineDash(dash);  // [实线长度, 间隙长度]
    this.ctx.lineDashOffset = offset;
    this.ctx.strokeRect(
        x  * this.scaleX, 
        y  * this.scaleY,
        x1 * this.scaleX,
        y1 * this.scaleY,
    );
  }

  arc(x, y, r, start = 0, stop = 2 * Math.PI) {
    // 以x轴坐标作为参照
    this.ctx.beginPath();
    this.ctx.arc(
        x * this.scaleX,
        y * this.x / this.y,
        r * this.scaleY,
        start, 
        stop
    );
    this.ctx.stroke();
    return this;
  }

  // 设置新图像如何绘制到已有的图像上
  globalCompositeOperation(style = 'source-in') {
    const styles = [
        'source-in',
        'source-out', // 
        'source-atop', // 新图像仅显示与老图像重叠部分
        'destination-over', // 新图像在老图像下面
        'destination-in',   // 显示重叠部分的老图像
        'destination-out',  // 新图像及重叠部分不显示
        'destination-atop', // 老图像金显示重叠部分
        'lighter', // 重叠区域颜色做加处理
        'darken',  // 保留重叠部分最黑的像素 
        'lighten', // 保留重叠部分最亮的像素
        'xor',  // 重叠部分变为透明
        'copy', // 只有新图像会被保留，其余的全部被清除(边透明) 
    ];
    
    if (styles.indesOf(style) === -1) return this;

    this.ctx.globalCompositeOperation = style;
    return this;
  }

  // 创建矩形
  rect () {
  }

  // 绘制填充矩形
  fillRect (startX, startY, endX, endY) {
    this.ctx.fillRect(
        startX * this.scaleX,
        startY * this.scaleY,
        endX * this.scaleX,
        endY * this.scaleY,
    );
    return this;
  }

  font (fontStr = '26px Arial') {
    this.ctx.font = fontStr;
    return this;
  }

  fillText (text, startX, startY) {
    this.ctx.fillText(text, startX, startY);
    return this;
  }

  line (startX, startY, endX, endY, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.closePath();

    ctx.lineWidth = lineWidth;
    ctx.stroke();

    return this;
  }
}
