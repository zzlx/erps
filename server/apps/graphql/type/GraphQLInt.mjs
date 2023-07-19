/**
 * *****************************************************************************
 *
 * GraphQL Int Object
 *
 * *****************************************************************************
 */

import { inspect } from '../../utils/inspect.mjs';
import { GraphQLScalarType } from './GraphQLScalarType.mjs';
import { Kind } from '../language/Kind.mjs'; 

export const GraphQLInt = new GraphQLScalarType({
  name: 'Int',
  description: 'The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. ',
  serialize: serializeInt,
  parseValue: coerceInt,
  parseLiteral: function parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      var num = parseInt(ast.value, 10);

      if (num <= MAX_INT && num >= MIN_INT) {
        return num;
      }
    }

    return undefined;
  }
});

// As per the GraphQL Spec, Integers are only treated as valid when a valid
// 32-bit signed integer, providing the broadest support across platforms.
//
// n.b. JavaScript's integers are safe between -(2^53 - 1) and 2^53 - 1 
// because they are internally represented as IEEE 754 doubles.

// 32-bit有符号数字所能表示的最大和最小值
const MAX_INT = ~(1 << 31);
const MIN_INT = 1 << 31;

function serializeInt(value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  let num = value;

  if (typeof value === 'string' && value !== '') {
    num = Number(value);
  }

  if (!Number.isInteger(num)) {
    throw new TypeError(
      `Int cannot represent non-integer value: ${inspect(value)}`
    );
  }

  if (num > MAX_INT || num < MIN_INT) {
    throw new TypeError(
      `Int cannot represent non 32-bit signed integer value: ${inspect(value)}`
    );
  }

  return num;
}

// coerce int
function coerceInt(value) {
  if (!Number.isInteger(value)) {
    throw new TypeError(
      "Int cannot represent non-integer value: ".concat(inspect(value))
    );
  }

  if (value > MAX_INT || value < MIN_INT) {
    throw new TypeError(
      "Int cannot represent non 32-bit signed integer value: ".concat(inspect(value))
    );
  }

  return value;
}
