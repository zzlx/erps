/**
 * 图标
 *
 */

import React from 'react';
import sprites from '../sprites.json';

export default function Sprite (props = {}) {
  const { showAll, id, width, height, ...rests } = props;
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
    d: icon.path || '',
    transform: icon.transform || null,
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
