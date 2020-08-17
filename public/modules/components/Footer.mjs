/**
 * *****************************************************************************
 *
 * Footer
 *
 * 页脚组件
 *
 * *****************************************************************************
 */

export default function Footer (props) {
  const { fluid, className, ...rests } = props; 

  // 应用footer类名 
  const footerCN = [
    'footer',
    'd-print-none',
    className,
  ].filter(Boolean).join(' ');

  const innerCN = [
    fluid ? 'container-fluid' : 'container',
    'font-weight-light',
    'p-2',
  ].filter(Boolean).join(' ');

  return React.createElement('footer', {
    className: footerCN,
  }, React.createElement('div', {
    className: innerCN,
    ...rests
  }));
}
