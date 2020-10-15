/**
 * *****************************************************************************
 *
 * Message component
 *
 * 信息提示框(通知、警告、反馈等)
 * Contextual feedback messages for typical user actions 
 * with the handful of available and flexible alert messages.
 *
 * 逻辑:
 * 2. 固定通知，单机关闭图标取消，或采用向左滑动取消(尚未实现);
 * 3. 设置通知消息最大行数,超行将需要同时设置消息显示省略设置;
 * 4. 格式化显示通知内容;
 * 5. 横幅通知、通知中心、锁屏通知
 *
 * 使用方法：
 * 给Message一个fixed定位的透明背景容器(比如通知中心),Message可以悬浮在主界面上
 *
 * *****************************************************************************
 */

export default class Message extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      disappear: false,
      DOMRect: null,
      startTouchList: null,
      moveTouchList: null,
    };

    // 绑定this
    this.handleCloseClick = handleCloseClick.bind(this);
    this.handleTouchStart = handleTouchStart.bind(this);
    this.handleTouchMove = handleTouchMove.bind(this);
    this.handleTouchEnd = handleTouchEnd.bind(this);
  }

  render () {
    const { 
      theme, timeout, dismissible,
      className, children, ...rest 
    } = this.props;

    // 构造className
    const cn_alert = [
      'alert',
      `alert-${theme ? theme : 'primary'}`,
      (dismissible || (timeout && timeout > 0)) ? 'alert-dismissible' : null,
      this.state.disappear ? 'd-none': null,
      className,
    ].filter(Boolean).join(' '); 

    const closeButton = dismissible ? React.createElement('button', {
      type: "button",
      className: "close",
      'data-dismiss': "alert",
      'aria-label': "Close",
      onClick: this.handleCloseClick,
    }, 'x') : null;

    // 
		const newChildren = React.Children.map(children, (child, i) => {
			if (!React.isValidElement(child)) return child;

      if (i === 0 && /^h[1-6]$/.test(child.type)) {

        const className = child.props.className;
        const cn = [
          'alert-heading',
          child.props.className,
        ].filter(Boolean).join(' ');

        child = React.cloneElement(child, {
          className: cn,
        });
      }

      return child;
    });

    return React.createElement('div', {
      className: cn_alert,
      draggable: true,
      role: 'alert',
      onTouchStart: dismissible ? null : this.handleTouchStart, 
      onTouchMove: dismissible ? null : this.handleTouchMove, 
      onTouchEnd: dismissible ? null : this.handleTouchEnd, 
      ...rest,
    }, newChildren, closeButton);
  }

  componentDidMount () {
    if (this.props.timeout && this.props.timeout > 0 ) {
      this._timeout = setTimeout(() => {
        this.setState(state => ({disappear: true}));
      }, this.props.timeout * 1000);
    }
  }

  componentWillUnmount () {
    if (this._timeout) clearTimeout(this._timeout);
  }
}

function handleCloseClick (e) {
  this.setState(state => ({disappear: true}));
}

//
function handleTouchStart (e) {
  // 获取数据
  const DOMRect = e.target.getBoundingClientRect();
  const TouchList = e.targetTouches;

  // 保存DOMRect数据
  this.setState(state => ({DOMRect: DOMRect}));
  this.setState(state => ({startTouchList: TouchList}));
}

function handleTouchMove (e) {
  const TouchList = e.targetTouches;
  this.setState(state => ({moveTouchList: TouchList}));
}

function handleTouchEnd (e) {
  // 计算TouchStart到TouchEnd位移
  const displacement = this.state.moveTouchList[0].clientX - this.state.startTouchList[0].clientX;

  // 判断位移是否大于DOMRect的1/3
  if (Math.abs(displacement) > this.state.DOMRect.width/3) {
    // 设置alert显示状态
    e.target.classList.add('d-none');
  }
}
