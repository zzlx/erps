/**
 * *****************************************************************************
 *
 * Inspect
 *
 * 审查value,以字符形式输出
 *
 * *****************************************************************************
 */

export function inspect(value) {
  if (value instanceof Uint8Array) return value.toString('hex');
        
  switch (typeof(value)) {
    case 'string':
      return JSON.stringify(value);
    case 'function':
      return value.toString();
    case 'object':
      if (value) {
        const customInspectFn = getCustomFn(value);

        if (customInspectFn) {
          const customValue = customInspectFn.call(value);
          return typeof customValue === 'string' 
            ? customValue 
            : inspect(customValue);
        } else if (Array.isArray(value)) {
          return '[' + value.map(inspect).join(', ') + ']';
        }

        const properties = Object.keys(value)
          .map(k => `${k}: ${inspect(value[k])}`)
          .join(', ');

        return properties ? '{ ' + properties + ' }' : '{}';
      }

      return String(value);
    case 'number':
    case 'undefined':
    default:
      return String(value);
  }
}

function getCustomFn(object) {
  const customInspectFn = object[Symbol.for('nodejs.util.inspect.custom')];
  if (typeof customInspectFn === 'function') return customInspectFn;
  if (typeof object.inspect === 'function') return object.inspect;
}
