/**
 * Popover 
 */

export default function popover (props) {
  const {type, children, onClick} = props;

  return React.createElement('button', {
    type: "button",
    className: `btn btn-${type}`,
  });
}
