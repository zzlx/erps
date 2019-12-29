import global from '../utils/global.mjs';

export default () => {}

  // 用于布局组件
  // 屏幕翻转位置
  global.onorientationchange = () => {
    switch(global.orientation){
      case -90:
      case 90:
      case 180:
      case 0:
      break;
    }
  }  　
