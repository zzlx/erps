/**
 * *****************************************************************************
 *
 * Scalar Type Definition
 *
 * The leaf values of any request and input values to arguments are
 * Scalars (or Enums) and are defined with a name and a series of functions
 * used to parse input from ast or variables and to ensure validity.
 *
 * If a type's serialize function does not return a value (i.e. it returns
 * `undefined`) then an error will be raised and a `null` value will be returned
 * in the response. If the serialize function returns `null`, then no error will
 * be included in the response.
 *
 * Example:
 *
 *     const OddType = new GraphQLScalarType({
 *       name: 'Odd',
 *       serialize(value) {
 *         if (value % 2 === 1) {
 *           return value;
 *         }
 *       }
 *     });
 *
 * *****************************************************************************
 */

import { 
  assert, 
  defineToStringTag,
  defineToJSON,
  inspect,
} from '../../utils.lib.mjs';

export class GraphQLScalarType {
  constructor(config) {
    assert(typeof config.name === 'string', 'Must provide name.');
    this.name = config.name;
    this.description = config.description;

    assert(
      (typeof config.serialize === 'function'), 
      "".concat(this.name, " must provide \"serialize\" function. If this custom Scalar ") + 
      'is also used as an input type, ensure "parseValue" and "parseLiteral" ' + 
      'functions are also provided.'
    );
    this.serialize = config.serialize;

    if (config.parseValue || config.parseLiteral) {
      assert(
        typeof config.parseValue === 'function' && 
        typeof config.parseLiteral === 'function', 
        `${this.name} must provide both parseValue and parseLiteral functions.`) 
    }
    this.parseValue = config.parseValue || function (value) { return value };
    this.parseLiteral = config.parseLiteral || valueFromASTUntyped;

    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes;
  }

  toString() {
    return this.name;
  }
}

// Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported
defineToStringTag(GraphQLScalarType);
defineToJSON(GraphQLScalarType);

// eslint-disable-next-line no-redeclare
export function isScalarType(type) {
  return type instanceof GraphQLScalarType;
}

export function assertScalarType(type) {
  assert(
    isScalarType(type), 
    "Expected ".concat(inspect(type), " to be a GraphQL Scalar type.")
  ); 
  return type;
}
