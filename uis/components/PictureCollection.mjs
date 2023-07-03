/**
 * *****************************************************************************
 *
 * Picture Collection
 * 图片采集器
 *
 * *****************************************************************************
 */

import React from './React.mjs';
import Button from './Button.mjs';

export default class PictureCollection extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = { 
      mediaDevices: [], 
      deviceId: null,
    }
  }

  render() {
    const e = React.createElement;
    const canvas_a4 = e('canvas', {
      id: "canvas_a4",
      width: 1240 * 1.2,
      height: 1754 * 1.2,
      className: 'border',
      style: {maxWidth: '375px'}
    }, 'Canvas不被支持');

    const canvas_zoom = e('canvas', {
      id: "canvas_zoom",
      width: "200",
      height: "200",
      className: 'border',
      style: {maxWidth: '375px'}
    }, 'Canvas不被支持');

    const button_save = e(Button, { onClick: savePicture, }, '保存');
    const button_photo = e(Button, { 
      onClick: (event) => this.photo(this.state.deviceId, event), 
    }, '打开摄像头');
    const button_picture = e(Button, { onClick: takePicture, }, '预览');
    const video = e('video', {
      id: 'video_a4',
      autoPlay: true,
      className: 'd-none',
      width: 2048,
      style: { 
        objectFit: 'fill',
        //rotation: '180deg', 
        //rotationPoint: '50% 50%',
        //transform: 'translate(-50%,-50%)'
      }
    });

    const button_group = e(Button.Group, null,
      button_save,
      button_photo,
      button_picture,
    );

    const label = e('label', { className: 'input-group-text', }, '设备列表');
    const inputGroupPrepend = e('div', {className: 'input-group-prepend'}, label);

    const options = this.state.mediaDevices.map((item, index) => e('option', {
      key: index,
      value: item.deviceId,
      children: item.label
    }))
    const select = e('select', {
      className: 'custom-select',
      onChange: (e) => this.setState({ deviceId: e.target.value}),
    }, options);
    const inputGroup = e('div',{ className: 'input-group mb-3'}, 
      inputGroupPrepend,
      select,
    );

    const div = e('div', null, button_group, inputGroup);

    const content = e('div', null, 
      canvas_a4, 
      video,
      canvas_zoom,
      div,
    ); 

    return content;
  }
}

PictureCollection.prototype.componentDidMount = function () {
  // 异步获取视频设备列表
  window.navigator.mediaDevices.enumerateDevices().then(devices => {
    let vedioDevices = [];
    for (let device of devices) {
      if (device.kind === 'videoinput') vedioDevices.push(device);
    }
    this.setState((state, props) => ({ 
      mediaDevices: vedioDevices,
      deviceId: vedioDevices[0].deviceId
    }));
    console.log(this.state);
  }).catch(err => console.log(err.name + ": " + err.message));

  //draw("#canvas_a4");
  const canvas = document.querySelector("#canvas_a4");
  canvas.addEventListener('mousemove', zoom);

  const scaleX = canvas.width / window.innerWidth;
  const scaleY = canvas.height / window.innerHeight;

  //const scaleToFit = Math.min(scaleX, scaleY);
  //const scaleToCover = Math.max(scaleX, scaleY);

  //canvas.style.transformOrigin = '0 0';
  //canvas.style.transform = 'scale(' + scaleToFit + ')';

}

PictureCollection.prototype.photo = function (deviceId) {
  const video = document.querySelector("#video_a4");
  const constraints = window.navigator.mediaDevices.getSupportedConstraints();
  console.log(constraints);
  const opts = {
    audio: false, // 不启用音频
    video: {
      deviceId: constraints.deviceId 
        ? deviceId 
          ? deviceId 
          : null 
        : null,
      facingMode: constraints.facingMode || false,
      frameRate: constraints.frameRate ? { ideal: 5, max: 10 } : null,
      width: { min: 1280, ideal: 2048, max: 4000 },
      //height: { min: 960, ideal: 1536, max: 3000 },
      //aspectRatio: constraints.aspectRatio ? 297/210 : false,
    }
  };

  // 获取媒体数据流
  window.navigator.mediaDevices.getUserMedia(opts)
  .then(stream => {
    video.srcObject = stream; 
    video.onloadedmetadata = function(e) {
      video.play();
      //video.addEventListener('click', takePicture);
      const videoTracks = video.videoTracks;
    };
  })
  .catch(err => { console.log(err); })
}

function takePicture(e) {
  const video = document.getElementById('video_a4');
  const canvas = document.getElementById('canvas_a4');
  //const photo = document.getElementById('photo');

  const draw = new Draw(canvas);
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw.rotate();
  const cWidth = canvas.width;
  const cHeight = canvas.height;
  const vWidth = video.videoWidth;
  const vHeight = video.videoHeight;
  const r = cWidth/vWidth;
  draw.drawImage(video, 105, 120, vWidth-80, vHeight-80, 0, 0, vWidth, vHeight);
  draw.restore();

  const data = canvas.toDataURL('image/png');
  canvas.addEventListener('mousemove', zoom);

}

function zoom(e) {
  return;
  const x = e.layerX;
  const y = e.layerY;
  const scale = Math.round(1240/375);

  const canvas = e.currentTarget;
  canvas.style.cursor="crosshair";
  const zoomctx = document.querySelector("#canvas_zoom").getContext('2d');
  zoomctx.imageSmoothingEnabled = true;

  zoomctx.drawImage(
    canvas, 
    Math.abs(x*scale - 100), 
    Math.abs(y*scale - 100), 
    200, 200, 
    0, 0, 
    200, 200
  );
}

function savePicture(e) {
  const canvas = document.querySelector("#canvas_a4");

  const a = document.createElement('a')
  //const url = canvas.toDataURL('image/png');
   //var event = new MouseEvent('click');
  //const png = canvas.toDataURL('image/png');
  //a.dispatchEvent(event)
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    //var reader  = new FileReader();
    //reader.readAsDataURL(blob);
    a.download = '.png';
    //console.log(reader);
    a.href = url
    a.click();
    //@todo: 实现图片上传
  });

  const video = document.querySelector("#video_a4");
  const stream = video.srcObject;

  if (stream) {
    const tracks = stream.getTracks();

    tracks.forEach(track => {
      console.log(track);
      track.stop();
    })

    video.srcObject = null;
  }
}

/**
 *
 *
 */
function draw(id) {
  const canvas = document.querySelector(id);
  const ctx = canvas.getContext('2d');
  //const p = new Path2D("M10 10 h 80 v 80 h -80 Z");
  //ctx.stroke(p);
  const draw = new Draw(ctx);
  const img = new Image();
  img.addEventListener('load', () => {
    draw.rotate();
    ctx.drawImage(img,0,0);
    img.style.display = 'none';

  });
  img.src = process.env.PUBLIC_URL + '/static/media/graphql_bg.jpg';

}

/**
 * 绘图工具库
 */
class Draw {
  constructor(canvas) {
    this.ctx = canvas.getContext('2d');
  }

  restore() {
    this.ctx.restore();
  }
  rotate() {
    this.ctx.save();
    this.ctx.rotate(-Math.PI/2)
    this.ctx.translate(-1754*1.2, 0);
  }

  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    return this.ctx;
  }

  rect(x, y, width, height) {
    this.ctx.rect(x, y, width, height);
    return this.ctx;
  }

  fillRect(x, y, width, height) {
    return this.ctx;
  }

  strokeRect(x, y, width, height) {
    return this.ctx;
  }

  clearRect(x, y, width, height) {
    return this.ctx;
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise) {
    return this.ctx;
  }

  quadraticCurveTo(cp1x, cp1y, x, y) {
    return this.ctx;
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    return this.ctx;
  }

  createPattern(image, type) {
    return this.ctx;
  }

  fillText(text, x, y, maxWidth) {
    return this.ctx;
  }

  strokeText(text, x, y ,maxWidth) {
    return this.ctx;
  }

}

Draw.prototype.lineWidth = function(x, y) {
   for (var i = 0; i < 10; i++){
    this.ctx.lineWidth = 1+i;
    this.ctx.beginPath();
    this.ctx.moveTo(5+i*14,5);
    this.ctx.lineTo(5+i*14,140);
    this.ctx.stroke();
  }

}

Draw.prototype.circleColor = function(x, y) {
    // 画背景
  this.ctx.fillStyle = '#FD0';
  this.ctx.fillRect(0,0,75,75);
  this.ctx.fillStyle = '#6C0';
  this.ctx.fillRect(75,0,75,75);
  this.ctx.fillStyle = '#09F';
  this.ctx.fillRect(0,75,75,75);
  this.ctx.fillStyle = '#F30';
  this.ctx.fillRect(75,75,75,75);
  this.ctx.fillStyle = '#FFF';

  // 设置透明度值
  this.ctx.globalAlpha = 0.2;

  // 画半透明圆
  for (let i=0;i<7;i++){
      this.ctx.beginPath();
      this.ctx.arc(75,75,10+10*i,0,Math.PI*2,true);
      this.ctx.fill();
  }
}


Draw.prototype.circle = function(x, y) {
  for (var i=0;i<6;i++){
    for (var j=0;j<6;j++){
      this.ctx.strokeStyle = 'rgb(0,' + Math.floor(255-42.5*i) + ',' +
                       Math.floor(255-42.5*j) + ')';
      this.ctx.beginPath();
      this.ctx.arc(12.5+j*25,12.5+i*25,10,0,Math.PI*2,true);
      this.ctx.stroke();
    }
  }
}

Draw.prototype.color = function(x, y) {
  for (let i=0;i<6;i++){
    for (let j=0;j<6;j++){
      this.ctx.fillStyle = 'rgb(' + Math.floor(255-42.5*i) + ',' +
                       Math.floor(255-42.5*j) + ',0)';
      this.ctx.fillRect(j*25,i*25,25,25);
    }
  }
}

Draw.prototype.dialog = function(x, y) {
  // 二次贝塞尔曲线
 this.ctx.beginPath();
 this.ctx.moveTo(x,y);
 this.ctx.quadraticCurveTo(x-50,y,x-50,y + 37.5);
 this.ctx.quadraticCurveTo(x-50,y+75,x-15,y+75);
 this.ctx.quadraticCurveTo(x-25,y+95,30,125);
 this.ctx.quadraticCurveTo(60,120,65,100);
 this.ctx.quadraticCurveTo(125,100,125,62.5);
 this.ctx.quadraticCurveTo(125,25,75,25);
 this.ctx.stroke();
}

// 绘制笑脸
Draw.prototype.smileFace = function (x, y) {
  this.ctx.beginPath();
  this.ctx.arc(x,y,50,0,Math.PI*2,true); // 绘制
  this.ctx.moveTo(x+35,y);
  this.ctx.arc(x,y,35,0,Math.PI,false);   // 口(顺时针)
  this.ctx.moveTo(x - 10,y - 10);
  this.ctx.arc(x - 15, y - 10,5,0,Math.PI*2,true);  // 左眼
  this.ctx.moveTo(x + 15 , y -10);
  this.ctx.arc(x + 15, y -10 , 5,0,Math.PI*2,true);  // 右眼
  this.ctx.stroke();
}

// 填充三角形
Draw.prototype.fillTri = function () {
 this.ctx.beginPath();
 this.ctx.moveTo(25,25);
 this.ctx.lineTo(105,25);
 this.ctx.lineTo(25,105);
 this.ctx.fill();

 // 描边三角形
 this.ctx.beginPath();
 this.ctx.moveTo(125,125);
 this.ctx.lineTo(125,45);
 this.ctx.lineTo(45,125);
 this.ctx.closePath();
 this.ctx.stroke();
}

function glDraw() {
  const canvas = document.querySelector("#canvas_1280");
  const gl = canvas.getContext("webgl");
  if (gl == null) return;

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
