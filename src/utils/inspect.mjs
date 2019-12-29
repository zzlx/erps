/**
 * Inspect
 * 用于在error messsage中打印value
 *
 */

import nodejsCustomInspectSymbol from './nodejsCustomInspectSymbol.mjs';

export default function inspect(value) {
  switch (typeof(value)) {
    case 'string':
      return JSON.stringify(value);

    case 'function':
      return value.name ? "[function ".concat(value.name, "]") : '[function]';

    case 'object':
      if (value) {
        const customInspectFn = getCustomFn(value);

        if (customInspectFn) {
          // $FlowFixMe(>=0.90.0)
          const customValue = customInspectFn.call(value);
          return typeof customValue === 'string' ? customValue : inspect(customValue);
        } else if (Array.isArray(value)) {
          return '[' + value.map(inspect).join(', ') + ']';
        }

        const properties = Object.keys(value).map(function (k) {
          return "".concat(k, ": ").concat(inspect(value[k]));
        }).join(', ');

        return properties ? '{ ' + properties + ' }' : '{}';
      }

      return String(value);

    default:
      return String(value);
  }
}

function getCustomFn(object) {
  const customInspectFn = object[String(nodejsCustomInspectSymbol)];
  if (typeof customInspectFn === 'function') return customInspectFn;
  if (typeof object.inspect === 'function') return object.inspect;
}
