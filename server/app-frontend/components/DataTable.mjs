/**
 * *****************************************************************************
 *
 * Table
 *
 * 表格组件: 直接从关联数组生成表格
 *
 * *****************************************************************************
 */

import React from './React.mjs';

export default function DataTable (props) {
  const { 
    data, 
    hover, dark, light, striped, bordered, 
    caption,
    className, children, ...rests 
  } = props;

  // table className
  const cn_table = [
    'table',
    hover && 'table-hover',
    dark ^ light && dark && 'table-dark',
    dark ^ light && light && 'table-light',
    striped && 'table-striped',
    bordered && 'table-bordered',
    className,
  ].filter(Boolean).join(' ');

  const Caption = React.createElement('caption', null, caption || null);

  const table = React.createElement('table', { 
    className: cn_table,
  }, Thead({data}), Tbody({data}), Caption);

  return React.createElement('div', { 
    ...rests,
    onScroll: e => console.log(e.type),
  }, children, table);
}

/* tbody */
function Tbody(props) {
  const { data, children, ...rests } = props;

  if (!data || data.length === 0) return null;

  const Trs = data.map((item,index) => {
    const Tds = Object.values(item).map((v,k) => {

      // 自动格式化单元格
      const cn = [];
      // 数字格式右对齐 
      
      const isNum = typeof v === 'number' || typeof v === 'string' && Number.isFinite(Number(v.replace(/[,?]/g, '')));


      if (isNum) {
        cn.push('text-right');
        cn.push('text-nowrap');
      } else {
        // 长文本应用缩略
        if (v && v.length > 10 ) cn.push('text-ellipsis');

        if (v && v.length <= 9) {
          cn.push('text-center');
        } else {
          cn.push('text-left');
          cn.push('text-nowrap');
        }
      }

      return React.createElement('td', { 
        key: k, 
        className: cn.join(' '),
      }, v)
    });

    return React.createElement('tr', { key: index }, Tds);
  });

  return React.createElement('tbody', { ...rests }, children, Trs);
}

/* thead */
function Thead(props) {
  const { data, children, ...rests } = props;
  if (!data || data.length === 0) return null;
  const keys = Object.keys(data[0]);
  const Ths = keys.map((v,k) => React.createElement('th', {
    key: k,
    className: 'text-center align-middle',
    style: {minWidth: '25px'},
  }, v));
  const Tr = React.createElement('tr', null, Ths);
  return React.createElement('thead', { ...rests }, children, Tr);
}
