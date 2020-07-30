/**
 *
 * 带边栏的页面布局
 *
 *
 */

export default function Layout (props) {
  const { 
    aside, // 侧边栏
    className, children, ...rests
  } = props;

  const cn = [
    'd-flex',
    'flex-column',
    'flex-sm-row',
    'align-content-stretch',
    'flex-grow-1',
    'overflow-hidden',
  ];
  if (className) cn.push(className);

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests,
  },
    Aside({children: aside}),
    Content({children: children}),
  );
}

function Aside (props) {
  const { className, children, ...rests } = props;

  // 配置className
  const cn = [];
  cn.push('d-print-none');
  cn.push('border');
  cn.push('overflow-auto');
  if (className) cn.push(className);

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests,
  }, children);
}

function Content (props) {
  const { className, children, ...rests } = props;

  // 配置className
  const cn = [];
  cn.push('overflow-auto');
  cn.push('flex-grow-1');
  cn.push('p-3');
  if (className) cn.push(className);

  return React.createElement('div', { 
    className: cn.join(' '), 
    ...rests,
  }, children);
}
