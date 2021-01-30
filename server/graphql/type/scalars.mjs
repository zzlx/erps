import { inspect } from '../../utils.lib.mjs';
import { GraphQLScalarType, isNamedType } from './definition.mjs';
import { Kind } from '../language/kinds.mjs'; 

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

function serializeFloat(value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  var num = value;

  if (typeof value === 'string' && value !== '') {
    num = Number(value);
  }

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

export const GraphQLFloat = new GraphQLScalarType({
  name: 'Float',
  description: 'The `Float` scalar type represents signed double-precision fractional ' + 'values as specified by ' + '[IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point). ',
  serialize: serializeFloat,
  parseValue: coerceFloat,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.FLOAT || ast.kind === Kind.INT ? parseFloat(ast.value) : undefined;
  }
}); // Support serializing objects with custom valueOf() or toJSON() functions -
// a common way to represent a complex value which can be represented as
// a string (ex: MongoDB id objects).

function serializeObject(value) {
  if (typeof(value) === 'object' && value !== null) {
    if (typeof value.valueOf === 'function') {
      var valueOfResult = value.valueOf();

      if (typeof(valueOfResult) !== 'object') {
        return valueOfResult;
      }
    }

    if (typeof value.toJSON === 'function') {
      // $FlowFixMe(>=0.90.0)
      return value.toJSON();
    }
  }

  return value;
}

function serializeString(rawValue) {
  const value = serializeObject(rawValue); // Serialize string, boolean and number values to a string, but do not
  // attempt to coerce object, function, symbol, or other types as strings.

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (Number.isFinite(value)) {
    return value.toString();
  }

  throw new TypeError("String cannot represent value: ".concat(inspect(rawValue)));
}

function coerceString(value) {
  if (typeof value !== 'string') {
    throw new TypeError("String cannot represent a non string value: ".concat(inspect(value)));
  }

  return value;
}

export const GraphQLString = new GraphQLScalarType({
  name: 'String',
  description: 'The `String` scalar type represents textual data, represented as UTF-8 ' + 'character sequences. The String type is most often used by GraphQL to ' + 'represent free-form human-readable text.',
  serialize: serializeString,
  parseValue: coerceString,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : undefined;
  }
});

function serializeBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (Number.isFinite(value)) {
    return value !== 0;
  }

  throw new TypeError("Boolean cannot represent a non boolean value: ".concat(inspect(value)));
}

function coerceBoolean(value) {
  if (typeof value !== 'boolean') {
    throw new TypeError("Boolean cannot represent a non boolean value: ".concat(inspect(value)));
  }

  return value;
}

export const GraphQLBoolean = new GraphQLScalarType({
  name: 'Boolean',
  description: 'The `Boolean` scalar type represents `true` or `false`.',
  serialize: serializeBoolean,
  parseValue: coerceBoolean,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.BOOLEAN ? ast.value : undefined;
  }
});

function serializeID(rawValue) {
  var value = serializeObject(rawValue);

  if (typeof value === 'string') {
    return value;
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  throw new TypeError("ID cannot represent value: ".concat(inspect(rawValue)));
}

function coerceID(value) {
  if (typeof value === 'string') {
    return value;
  }

  if (Number.isInteger(value)) {
    return value.toString();
  }

  throw new TypeError("ID cannot represent value: ".concat(inspect(value)));
}

export const GraphQLID = new GraphQLScalarType({
  name: 'ID',
  description: 'The `ID` scalar type represents a unique identifier, often used to ' + 'refetch an object or as key for a cache. The ID type appears in a JSON ' + 'response as a String; however, it is not intended to be human-readable. ' + 'When expected as an input type, any string (such as `"4"`) or integer ' + '(such as `4`) input value will be accepted as an ID.',
  serialize: serializeID,
  parseValue: coerceID,
  parseLiteral: function parseLiteral(ast) {
    return ast.kind === Kind.STRING || ast.kind === Kind.INT ? ast.value : undefined;
  }
});
export const specifiedScalarTypes = [
  GraphQLString, 
  GraphQLInt, 
  GraphQLFloat, 
  GraphQLBoolean, 
  GraphQLID
];

export function isSpecifiedScalarType(type) {
  return isNamedType(type) && ( 
    // Would prefer to use specifiedScalarTypes.some(), 
    // however %checks needs a simple expression.
    type.name === GraphQLString.name || 
    type.name === GraphQLInt.name || 
    type.name === GraphQLFloat.name || 
    type.name === GraphQLBoolean.name || 
    type.name === GraphQLID.name
  );
}
