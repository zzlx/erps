/**
 * *****************************************************************************
 *
 * GraphQL Boolean Object
 *
 * *****************************************************************************
 */

import { GraphQLScalarType } from './GraphQLScalarType.mjs';
import { Kind } from '../language/Kind.mjs'; 
import { inspect } from '../../utils/inspect.mjs';

export const GraphQLBoolean = new GraphQLScalarType({
  name: 'Boolean',
  description: 'The `Boolean` scalar type represents `true` or `false`.',
  serialize: serializeBoolean,
  parseValue: coerceBoolean,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.BOOLEAN ? ast.value : undefined;
  }
});

function serializeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (Number.isFinite(value)) return value !== 0;
  throw new TypeError("Boolean cannot represent a non boolean value: ".concat(inspect(value)));
}

function coerceBoolean(value) {
  if (typeof value === 'boolean') return value;
  throw new TypeError("Boolean cannot represent a non boolean value: ".concat(inspect(value)));
}
