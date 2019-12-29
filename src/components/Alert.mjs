/**
 * Alert
 *
 * A contextual feedback messages for typical user actions 
 * with the handful of available and flexible alert messages.
 *
 * 逻辑:
 * 2. 固定通知，单机关闭图标取消，或采用向左滑动取消(尚未实现);
 * 3. 设置通知消息最大行数,超行将需要同时设置消息显示省略设置;
 * 4. 格式化显示通知内容;
 * 5. 横幅通知、通知中心、锁屏通知
 *
 * 使用方法：
 * 给Alert一个fixed定位的透明背景容器(比如通知中心),Alert可以悬浮在主界面上
 *
 */

import React from 'react';

export default class Alert extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      disappear: false,
      DOMRect: null,
      startTouchList: null,
      moveTouchList: null,
    };

    // 绑定this
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }
}

Alert.prototype.render = function () {
  const { 
    theme, timeout, 
    dismissible,
    className, children, ...rest 
  } = this.props;

  const cn = ['alert']; // 构造className
  cn.push(`alert-${theme ? theme : 'primary'}`);
  if (dismissible || (timeout && timeout > 0)) cn.push('alert-dismissible');
  if (this.state.disappear) cn.push('d-none');
  if (className) cn.push(className);

  const closeButton = dismissible ? React.createElement('button', {
    type: "button",
    className: "close",
    'data-dismiss': "alert",
    'aria-label': "Close",
    onClick: this.handleCloseClick,
  }, 'x') : null;

  return React.createElement('div', {
    className: cn.join(' '),
    draggable: true,
    role: 'alert',
    onTouchStart: dismissible ? null : this.handleTouchStart, 
    onTouchMove: dismissible ? null : this.handleTouchMove, 
    onTouchEnd: dismissible ? null : this.handleTouchEnd, 
    ...rest,
  }, children, closeButton);
}

// 
Alert.prototype.handleCloseClick = function (e) {
  this.setState(state => ({disappear: true}));
}

//
Alert.prototype.handleTouchStart = function (e) {
  // 获取数据
  const DOMRect = e.target.getBoundingClientRect();
  const TouchList = e.targetTouches;

  // 保存DOMRect数据
  this.setState(state => ({DOMRect: DOMRect}));
  this.setState(state => ({startTouchList: TouchList}));
}

Alert.prototype.handleTouchMove = function (e) {
  const TouchList = e.targetTouches;
  this.setState(state => ({moveTouchList: TouchList}));
}

Alert.prototype.handleTouchEnd = function (e) {
  // 计算TouchStart到TouchEnd位移
  const displacement = this.state.moveTouchList[0].clientX - this.state.startTouchList[0].clientX;

  // 判断位移是否大于DOMRect的1/3
  if (Math.abs(displacement) > this.state.DOMRect.width/3) {
    // 设置alert显示状态
    e.target.classList.add('d-none');
  }
}

Alert.prototype.componentDidMount = function () {
  if (this.props.timeout && this.props.timeout > 0 ) {
    this._timeout = setTimeout(() => {
      this.setState(state => ({disappear: true}));
    }, this.props.timeout * 1000);
  }
}

Alert.prototype.componentWillUnmount = function () {
  if (this._timeout) clearTimeout(this._timeout);
}
