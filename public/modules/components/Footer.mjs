/**
 * 页脚组件
 *
 * 结构化组件
 */

export default function Footer (props) {
  const { className, ...rests } = props;

  // 应用footer类名 
  const cn = [
    'footer', // 与组件同名的样式类名
    'd-print-none',
    'p-2',
    'font-weight-light',
    'bg-gradient-primary',
    className,
  ].filter(Boolean).join(' ');

  return React.createElement('footer', {
    className: cn,
    ...rests,
  });
}
