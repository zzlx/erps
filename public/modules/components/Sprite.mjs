/**
 * 图标
 *
 * @return {obj} react element
 * @api public
 */

import React from 'react';

export default function Sprite (props = {}) {
  const { 
    showAll, 
    id, 
    path,
    transform,
    width, 
    height, 
    ...rests 
  } = props;
  let icon = null;
  const propsId = id || 'bookmark';

  // 
  const createIcon = (icon) => React.createElement('svg', {
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    width: width || '8',
    height: height || '8',
    viewBox: icon.viewBox || '0 0 8 8',
    ...rests,
  }, React.createElement('path', {
    d: path || '',
    transform: transform || null,
  }));
  
  // 执行查找
  for (let item of sprites) {
    if (item.id === propsId) {
      icon = item;
      break;
    }
  }

  return createIcon(icon);
}
