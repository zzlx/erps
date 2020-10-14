/**
 * *****************************************************************************
 *
 * Inspect
 *
 * 审查value,以字符形式输出
 *
 * *****************************************************************************
 */

export default function inspect(value) {
  switch (typeof(value)) {
    case 'string':
      return JSON.stringify(value);

    case 'function':
      return value.name ? `[function ${value.name}]` : '[function unnamed]';

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

    default:
      return String(value);
  }
}

function getCustomFn(object) {
  const nodejsCustomInspectSymbol = typeof Symbol === 'function' 
    ? Symbol.for('nodejs.util.inspect.custom') 
    : undefined;

  const customInspectFn = object[String(nodejsCustomInspectSymbol)];
  if (typeof customInspectFn === 'function') return customInspectFn;
  if (typeof object.inspect === 'function') return object.inspect;
}
