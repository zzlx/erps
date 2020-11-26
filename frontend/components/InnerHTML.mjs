/**
 * *****************************************************************************
 *
 * Inner html container
 *
 * *****************************************************************************
 */

export default function InnerHTML (props) {
  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: 'content'}
  });
}
