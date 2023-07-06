/**
 * *****************************************************************************
 *
 * GraphQL Float Object
 *
 * *****************************************************************************
 */

import { GraphQLScalarType } from './GraphQLScalarType.mjs';
import { serializeObject } from './GraphQLID.mjs';
import { Kind } from '../language/Kind.mjs'; 
import { inspect } from '../../utils/inspect.mjs';

export const GraphQLString = new GraphQLScalarType({
  name: 'String',
  description: 'The `String` scalar type represents textual data, represented as UTF-8 ' + 'character sequences. The String type is most often used by GraphQL to ' + 'represent free-form human-readable text.',
  serialize: serializeString,
  parseValue: coerceString,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : undefined;
  }
});

function serializeString(rawValue) {
  const value = serializeObject(rawValue); 

  // Serialize string, boolean and number values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.

  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Number.isFinite(value)) return value.toString();

  throw new TypeError(`String cannot represent value: ${inspect(rawValue)}`);
}

function coerceString(value) {
  if (typeof value === 'string') return value;
  throw new TypeError("String cannot represent a non string value: ".concat(inspect(value)));
}
