// Card group
export function CardGroup (props) {
  const {group, deck, columns, className, ...rests} = props;
  const cn = [];
  if (group || (!columns && !deck)) cn.push('card-group');
  if (columns) cn.push('card-columns');
  if (deck) cn.push('card-deck');
  return React.createElement('div', { ...rests, className: cn.join(' ')});
} 
