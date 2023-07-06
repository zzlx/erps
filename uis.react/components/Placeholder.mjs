/**
 * *****************************************************************************
 *
 * 占位行组件
 *
 * 用于在输出内容前输出占位行
 *
 * 获取占位行及margin-bottom合计高度，根据窗口位置计算需要的占位行数
 *
 * @param {number} props.row 占位行数
 * @return {object} react valid element.
 * @api public
 *
 * *****************************************************************************
 */

import React from './React.mjs';
const random = (start = 0, end = 100) => Math.floor(Math.random() * (end - start)) + start;

const sizes = ['xsmall', 'small', 'medium', 'large', 'full'];

export default class Placeholder extends React.PureComponent {
  constructor(props) {
    super(props);
    this.Ref = React.createRef();
    this.state = {
      rows: 15, // 默认15行
    };
  }

  render () {
    const { className, children, ...rests } = this.props;
    const cn = ['placeholder', className ].filter(Boolean).join(' ');

    return React.createElement('div', { 
      ref: this.Ref,
      className: cn, 
      ...rests, 
    }, children, React.createElement(Paragraph, {rows: this.state.rows}));
  }

  componentDidMount() {
    if (this.props.row) return;

    // element 
    const el = this.Ref.current;

    // 计算需要的行数
    const pTop = el.offsetTop;
    const windowHeight = window.innerHeight;
    const rows = Math.floor((windowHeight - pTop - 5)/50);
    this.setState({rows: rows});
  }
}

/**
 *
 */
function Paragraph (props) {
  const Ps = [];
  for (let i = 0; i < props.rows; i++)  {
    const index = randomInt(0, props.rows - 1);
    const row = React.createElement('p', {
      key: i,
      className: 'placeholder_' + sizes[index] + ' rainbow',
    }, '\xA0'); 

    Ps.push(row);
  } 

  return Ps;
}
