/**
 *
 * 页脚组件
 *
 * 结构化组件
 *
 */

export default function Footer (props) {
  const { 
    fluid,
    className, ...rests } = props;

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

  const inner = React.createElement('div', {
    className: innerCN,
    ...rests
  });

  return React.createElement('footer', {
    className: footerCN,
  }, inner);
}
