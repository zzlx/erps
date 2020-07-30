/**
 * *****************************************************************************
 *
 * Blockquote 
 *
 * 块引用
 *
 * *****************************************************************************
 */

export default function Blockquote(props = {}) {
  const { className, children, ...rests } = props;

  // blockquote className
  const cn_blockquote = [
    'blockquote',
    className
  ].filter(Boolean).join(' ');

  // blockquote-footer className
  const newChildren = React.Children.map(children, child => {
    if (child.type === 'footer') {
      const footer_cn = [
        'blockquote-footer',
        child.props.className
      ].filter(Boolean).join(' ');

      return React.cloneElement(child, { className: footer_cn, });
    }
    return child;
  });

  return React.createElement('blockquote', {
    className: cn_blockquote,
    ...rests,
  }, newChildren);
}

// test
// Blockquote({children: 'test'});
