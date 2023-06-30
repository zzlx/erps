/**
 * *****************************************************************************
 *
 * GraphQL ID Object
 *
 * *****************************************************************************
 */

import { inspect } from '../../utils/inspect.mjs';
import { GraphQLScalarType } from './GraphQLScalarType.mjs';
import { Kind } from '../language/Kind.mjs'; 

export const GraphQLID = new GraphQLScalarType({
  name: 'ID',
  description: 'The `ID` scalar type represents a unique identifier, often used to ' + 'refetch an object or as key for a cache. The ID type appears in a JSON ' + 'response as a String; however, it is not intended to be human-readable. ' + 'When expected as an input type, any string (such as `"4"`) or integer ' + '(such as `4`) input value will be accepted as an ID.',
  serialize: serializeID,
  parseValue: coerceID,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.STRING || ast.kind === Kind.INT ? ast.value : undefined;
  }
});

// Support serializing objects with custom valueOf() or toJSON() functions -
// a common way to represent a complex value which can be represented as
// a string (ex: MongoDB id objects).

export function serializeObject(value) {
  if (typeof(value) === 'object' && value !== null) {
    if (typeof value.valueOf === 'function') {
      const valueOfResult = value.valueOf();
      if (typeof(valueOfResult) !== 'object') return valueOfResult;
    }

    if (typeof value.toJSON === 'function') return value.toJSON();
  }

  return value;
}

function serializeID(rawValue) {
  const value = serializeObject(rawValue);

  if (typeof value === 'string') return value;
  if (Number.isInteger(value)) return String(value);

  throw new TypeError("ID cannot represent value: ".concat(inspect(rawValue)));
}

function coerceID(value) {
  if (typeof value === 'string') return value;
  if (Number.isInteger(value)) return value.toString();

  throw new TypeError("ID cannot represent value: ".concat(inspect(value)));
}

