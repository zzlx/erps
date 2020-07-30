/**
 * *****************************************************************************
 *
 * Badge component
 * 徽章
 *
 * *****************************************************************************
 */

export default function Badge (props) {
  const { theme, pill, className, ...rests } = props;

  const cn = ['badge'];
  if (pill) cn.push('badge-pill');
  if (theme) cn.push(`badge-${theme}`);
  if (className) cn.push(className);

  return React.createElement('sup', { 
    className: cn.join(' '),
    ...rests 
  }); 
}
