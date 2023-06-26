/**
 * *****************************************************************************
 *
 * GraphQL Float Object
 *
 * *****************************************************************************
 */

import { inspect } from '../../utils/inspect.mjs';
import { GraphQLScalarType } from './GraphQLScalarType.mjs';
import { Kind } from '../language/Kind.mjs'; 

export const GraphQLFloat = new GraphQLScalarType({
  name: 'Float',
  description: 'The `Float` scalar type represents signed double-precision fractional ' + 'values as specified by ' + '[IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). ',
  serialize: serializeFloat,
  parseValue: coerceFloat,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.FLOAT || ast.kind === Kind.INT ? parseFloat(ast.value) : undefined;
  }
}); 

function serializeFloat(value) {
  if (typeof value === 'boolean') return value ? 1 : 0;

  let num = value;
  if (typeof value === 'string' && value !== '') num = Number(value);

  if (!Number.isFinite(num)) {
    throw new TypeError("Float cannot represent non numeric value: ".concat(inspect(value)));
  }

  return num;
}

function coerceFloat(value) {
  if (!Number.isFinite(value)) {
    throw new TypeError("Float cannot represent non numeric value: ".concat(inspect(value)));
  }
  return value;
}
