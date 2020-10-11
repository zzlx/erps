/**
 * *****************************************************************************
 *
 *
 * Card is a flexible and extensible content container.
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default class Canvas extends React.PureComponent {
  constructor(props) {
    super(props);
    this.Ref = React.createRef();
    this.state = {
      size: 200,
      scale: 6,
    }

    //this.setState((state, props) => ({
    //  scale: window.devicePixelRatio,
    //}));
  }

  componentDidMount() {
    const canvas = this.Ref.current;
    if (!canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    canvas.setAttribute('width', 300 * this.state.scale);
    canvas.setAttribute('height', 150 * this.state.scale);

    const img = new Image();
    img.src = process.env.PUBLIC_URL + '/static/media/graphql_bg.jpg';
    console.log(img.src);
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      img.style.display = 'none';
    };

    canvas.addEventListener('mousemove', pick);

    /*
    ctx.scale(this.state.scale, this.state.scale);
    ctx.fillStyle = "#bada55";
    ctx.fillRect(1, 1, 399, 399);

    ctx.fillStyle = "#ffffff";
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
      ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);

    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 6; j++) {
        ctx.strokeStyle = 'rgb(0, ' + Math.floor(255 - 42.5 * i) + ', ' +
                         Math.floor(255 - 42.5 * j) + ')';
        ctx.beginPath();
        ctx.arc(12.5 + j * 25, 12.5 + i * 25, 10, 0, Math.PI * 2, true);
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    ctx.stroke();
      // set transparency value
    ctx.globalAlpha = 0.2;

    // Draw semi transparent circles
    for (var i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(75, 75, 10 + 10 * i, 0, Math.PI * 2, true);
      ctx.fill();
    }
      var offset = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setLineDash([4, 2]);
      ctx.lineDashOffset = -offset;
      ctx.strokeRect(1, 1, 300, 300);
    }

    function march() {
      offset++;
      if (offset > 16) {
        offset = 0;
      }
      draw();
      setTimeout(march, 20);
    }

    march();

    const x = this.state.size / 2;
    const y = this.state.size / 2;
    const textString = "I love MDN";
    ctx.fillText(textString, x, y);
    */
  }

  render() {
    const { className } = this.props;
    const cn = [];
    cn.push('border');
    cn.push('rounded');
    if (className) cn.push(className);

    // 定义样式
    const style = {
      width: this.state.size + 'px', 
      height: this.state.size + 'px'
    };

    const cautionMessage = '注意: 若出现此提示信息,请升级您的客户端版本!';
    return React.createElement('canvas', {
      ref: this.Ref,
      className: cn.length ? cn.join(' ') : null,
      style,
    }, cautionMessage);
  }
}

/**
 *
 * 1. Draws a filled rectangle.
 * fillRect(x, y, width, height) 
 *
 * 2. Draws a rectangular outline.
 * strokeRect(x, y, width, height) 
 *
 * 3. Clears the specified rectangular area, making it fully transparent.
 * clearRect(x, y, width, height) 
 *
 * 4. Creates a new path. Once created, future drawing commands are directed into the path and used to build the path up.
 * beginPath()
 * Path methods
 * Methods to set different paths for objects.
 * closePath()
 * Adds a straight line to the path, going to the start of the current sub-path.
 * stroke()
 * Draws the shape by stroking its outline.
 * fill()
 * Draws a solid shape by filling the path's content area.
 * arc(x, y, radius, startAngle, endAngle, anticlockwise)
Draws an arc which is centered at (x, y) position with radius r starting at startAngle and ending at endAngle going in the given direction indicated by anticlockwise (defaulting to clockwise).
arcTo(x1, y1, x2, y2, radius)
Draws an arc with the given control points and radius, connected to the previous point by a straight line.
 *
 */
function drawRect (ctx) {
  ctx.fillStyle = 'rgb(200, 0, 0)';
  ctx.fillRect(10, 10, 50, 50);

  ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
  ctx.fillRect(30, 30, 50, 50);
}


/**
 * 拾取像素色彩数据
 */

function pick(event) {
  const canvas = event.currentTarget;
  if (!canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const pixel = ctx.getImageData(event.layerX, event.layerY, 1, 1);
  const data = pixel.data;
  const rgba = 'rgba(' + data[0] + ', ' + data[1] +
             ', ' + data[2] + ', ' + (data[3] / 255) + ')';
}

/**
 * 修改像素数据
 */
function draw(event) {
  const canvas = event.currentTarget;
  if (!canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);
  img.style.display = 'none';
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
    
  var invert = function() {
    for (var i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscale = function() {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i]     = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };
}

/**
 * 处理图像
 * 将蓝色背景转为透明
 *
 *
 */
function computeFrame() {
  this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
  let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
  let l = frame.data.length / 4;

  for (let i = 0; i < l; i++) {
    let r = frame.data[i * 4 + 0];
    let g = frame.data[i * 4 + 1];
    let b = frame.data[i * 4 + 2];
    if (g > 100 && r > 100 && b < 43)
      frame.data[i * 4 + 3] = 0;
  }
  this.ctx2.putImageData(frame, 0, 0);
  return;
}
