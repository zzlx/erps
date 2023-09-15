/**
 *
 * Pagination
 *
 * 分页组件
 *
 * @todos: 能根据显示项目进行自动分页,
 * 1页显示完的不显示分页栏,
 * 需显示2页的显示上一页、下一页选项
 * 需显示3页及以上的情况显示<< 1 2 3 ... 5 >>
 *
 */

import React from './React.mjs';
import ALink from './ALink.mjs';

export default function Pagination (props) {
  let { data, align, sm, lg, className, children, ...rests } = props;

  const cn = ['pagination'];

  if (sm && !lg) cn.push('pagination-sm');
  if (!sm && lg) cn.push('pagination-lg');

  if (align) {
    // 验证align是否有效
    const alignment = [ 'start', 'center', 'end', 'between', 'around' ];
    if (alignment.indexOf(align) > 0) cn.push(`justify-content-${align}`);
  } else {
    cn.push(`justify-content-center`);
  }

  if (className) cn.push(className);

  const Items = data && Array.isArray(data)
    ? data.map((v,k) => {
        const link = React.createElement(Anchor, {
          title: ++k,
          href: v.href,
        });

        return React.createElement('li', { key: k }, link);
      })
    : null;

  const pagination = React.createElement('ul', { 
    className: cn.join(' '), 
    ...rests 
  }, Items, children);

  return React.createElement('nav', { 
    'aria-label': 'Page navigation',
  }, pagination);
}
