/**
 * *****************************************************************************
 *
 * Container component
 *
 * Loaout组件,提供一个容器组件
 *
 * @param {bool} props.fluid
 * @param {string} props.breakpoint
 * @return {obj} React element
 * @api public
 * *****************************************************************************
 */

const breakpoints = ['sm', 'md', 'lg', 'xl'];

export default function Container (props) {
  const { 
    breakpoint, fluid, 
    className, ...rests 
  } = props;

  let bp = breakpoint; // breakpoint需要进行检查

  if (bp && breakpoints.indexOf(bp) === -1) {
    console.warn(bp + ' is not a valid breakpoint for Container component!');
    bp = 'md';
  }

  // 根据props属性构造className
  const cn = [
    fluid ? 'container-fluid' : 'container',
    bp ? 'container-' + bp : null,
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('div', { className: cn, ...rests });
}
