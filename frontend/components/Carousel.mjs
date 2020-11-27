/**
 * *****************************************************************************
 *
 * Carousel component
 *
 * 轮播(走马灯)组件,用于播放幻灯片放映效果
 *
 * *****************************************************************************
 */

import React from './_React.mjs';

export default class Carousel extends React.PureComponent {
  static defaultProps = {
    withControl: true,
    withIndicators: true,
    crossFade: true,
    interval: 3000,
  };

  constructor(props) {
    super(props);

    this.Ref = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  render() {
    const { 
      interval,
      crossFade, withControl, withIndicators, 
      className, children, ...rests 
    } = this.props;

    const cn = ['carousel', 'slide']; // 构造className
    if (crossFade) cn.push('carousel-fade');
    if (crossFade) cn.push('overflow-hidden');
    if (className) cn.push(className);

    const Inner = React.createElement('div', { className: 'carousel-inner', }, children);

    return React.createElement('div', {
      ref: this.Ref,
      className: cn.join(' '),
      onClick: this.handleClick,
      onMouseOver: this.handleMouseOver,
      onMouseOut: this.handleMouseOut,
      ...rests,
    }, Inner);
  }

  handleMouseOver(e) {
    e.preventDefault(); 
    clearInterval(this.timer);
  }

  handleMouseOut(e) {
    e.preventDefault(); 
    this.timer = setInterval(() => { 
      this.Ref.current.querySelector('a.carousel-control-next').click(); 
    }, this.props.interval);
  }
  
  // click翻页控制
  handleClick(e) {
    e.preventDefault(); 
    const c = e.currentTarget;
    const active = c.querySelector('.carousel-item.active');
    const active_i = c.querySelector('.carousel-indicators li.active');

    // next
    let next = null;
    let next_i = null;
    if (e.target.classList.contains('carousel-control-prev') 
     || e.target.classList.contains('carousel-control-prev-icon')) {
      next = active.previousSibling || active.parentNode.lastChild;
      next_i = active_i.previousSibling || active_i.parentNode.lastChild;
    } 

    if (e.target.dataset.slideTo) {
      let n = Number(e.target.dataset.slideTo) + 1;
      next = c.querySelector('.carousel-item:nth-child(' + n + ')') 
      next_i = e.target;
    }

    if (e.target.classList.contains('carousel-control-next') 
     || e.target.classList.contains('carousel-control-next-icon')) {
      next = active.nextSibling || active.parentNode.firstChild;
      next_i = active_i.nextSibling || active_i.parentNode.firstChild;
    }
    if (!next) return;

    active_i.classList.remove('active');
    active.classList.remove('active');
    next.classList.add('active');
    next_i.classList.add('active');
  }

  componentDidMount() {
    const c = this.Ref.current;

    // 添加样式
    const items = c.getElementsByClassName('carousel-inner').item(0).children;

    // indicators
    const ol = document.createElement('ol');
    ol.classList.add('carousel-indicators');

    for (let i = 0; i < items.length; i++) {
      items.item(i).classList.add('carousel-item');
      const li = document.createElement('li');
      li.dataset.slideTo = i;
      ol.appendChild(li);
    }

    // 默认显示第1个item
    ol.firstChild.classList.add('active');
    items.item(0).classList.add('active');
    const caption = c.querySelectorAll('.carousel-item div').forEach(v => {
      v.classList.add('carousel-caption');
    })

    // control
    const prev = document.createElement('a');
    prev.classList.add('carousel-control-prev');
    prev.setAttribute('role', 'button');
    prev.setAttribute('href', '#prev');
    prev.innerHTML = '<span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Prev</span>';

    const next = document.createElement('a');
    next.classList.add('carousel-control-next');
    next.setAttribute('role', 'button');
    next.setAttribute('href', '#next');
    next.innerHTML = '<span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span>';

    // appendChild
    c.appendChild(prev);
    c.appendChild(next);
    c.prepend(ol);

    this.timer = setInterval(
      () => { c.querySelector('a.carousel-control-next').click(); },
      this.props.interval
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }
  
}
