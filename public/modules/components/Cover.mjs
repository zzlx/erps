/**
 * *****************************************************************************
 *
 * Cover
 *
 * *****************************************************************************
 */

export default class Cover extends React.PureComponent {
  render () {
    const { 
      className, ...rests 
    } = this.props;

    // 根据props属性构造className
    const cn = [
      'd-flex',
      'w-100',
      'h-100',
      'mx-auto',
      'flex-column',
      className,
    ].filter(Boolean).join(' ');

    return React.createElement('div', { className: cn, ...rests });
  }

  componentDidMount() {


  }

  componentWillUnmount() {
  }
}
