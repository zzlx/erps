/**
 * Picture component 
 *
 * 使用场景:
 * 为不同的设备提供多个版本的显示源，以获得最佳显示尺寸及效果
 * 
 * @param props
 *
 */

import React from 'react';

export default function Picture (props) {
  const { src, sources, ...rests } = props;

  const Sources = Array.isArray(sources) 
    ? sources.map((source, index) => {
      return React.createElement('source', { 
        srcset: source.src,
        media: source.media, 
        key: index,
      });
    })
    : null;

  const Img = React.createElement('img', { src: src, ...rests, });
  
  return React.createElement('picture', null, Sources, Img);
}
