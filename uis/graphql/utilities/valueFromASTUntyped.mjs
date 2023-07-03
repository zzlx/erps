/**
 * Produces a JavaScript value given a GraphQL Value AST.
 *
 * Unlike `valueFromAST()`, no type is provided. The resulting JavaScript value
 * will reflect the provided GraphQL value AST.
 *
 * | GraphQL Value        | JavaScript Value |
 * | -------------------- | ---------------- |
 * | Input Object         | Object           |
 * | List                 | Array            |
 * | Boolean              | Boolean          |
 * | String / Enum        | String           |
 * | Int / Float          | Number           |
 * | Null                 | null             |
 *
 */

import { assert } from '../../utils/assert.mjs';
import { keyValMap } from '../../utils/keyValMap.mjs';

import { Kind } from '../language/index.mjs';

export function valueFromASTUntyped(valueNode, variables) {
  switch (valueNode.kind) {
    case Kind.NULL:
      return null;

    case Kind.INT:
      return parseInt(valueNode.value, 10);

    case Kind.FLOAT:
      return parseFloat(valueNode.value);

    case Kind.STRING:
    case Kind.ENUM:
    case Kind.BOOLEAN:
      return valueNode.value;

    case Kind.LIST:
      return valueNode.values.map(function (node) {
        return valueFromASTUntyped(node, variables);
      });

    case Kind.OBJECT:
      return keyValMap(valueNode.fields, function (field) {
        return field.name.value;
      }, function (field) {
        return valueFromASTUntyped(field.value, variables);
      });

    case Kind.VARIABLE:
      var variableName = valueNode.name.value;
      return variables && !assert.isInvalid(variables[variableName]) ? variables[variableName] : undefined;
  }
  /* istanbul ignore next */


  throw new Error('Unexpected value kind: ' + valueNode.kind);
}
