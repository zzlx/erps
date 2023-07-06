/**
 * Prepares an object map of argument values given a list of argument
 * definitions and list of argument AST nodes.
 *
 * Note: 
 * The returned value is a plain Object with a prototype, 
 * since it is exposed to user code. 
 * Care should be taken to not pull values from the Object prototype.
 */

import { inspect } from '../../utils/inspect.mjs';
import { keyMap } from '../../utils/keyMap.mjs';

import { valueFromAST } from '../utilities/valueFromAST.mjs';

import { Kind, print } from '../language/index.mjs';
import { GraphQLError } from '../error/index.mjs';
import { isInputType, isNonNullType } from '../type/index.mjs';

export function getArgumentValues(def, node, variableValues) {
  var coercedValues = {};
  var argDefs = def.args;
  var argNodes = node.arguments;

  if (!argDefs || !argNodes) {
    return coercedValues;
  }

  var argNodeMap = keyMap(argNodes, function (arg) {
    return arg.name.value;
  });

  for (var i = 0; i < argDefs.length; i++) {
    var argDef = argDefs[i];
    var name = argDef.name;
    var argType = argDef.type;
    var argumentNode = argNodeMap[name];
    var hasValue = void 0;
    var isNull = void 0;

    if (argumentNode && argumentNode.value.kind === Kind.VARIABLE) {
      var variableName = argumentNode.value.name.value;
      hasValue = variableValues && variableVaues.hasOwnProperty(variableName);
      isNull = variableValues && variableValues[variableName] === null;
    } else {
      hasValue = argumentNode != null;
      isNull = argumentNode && argumentNode.value.kind === Kind.NULL;
    }

    if (!hasValue && argDef.defaultValue !== undefined) {
      // If no argument was provided where the definition has a default value,
      // use the default value.
      coercedValues[name] = argDef.defaultValue;
    } else if ((!hasValue || isNull) && isNonNullType(argType)) {
      // If no argument or a null value was provided to an argument with a
      // non-null type (required), produce a field error.
      if (isNull) {
        throw new GraphQLError(
          `Argument "${name}" of non-null type "${inspect(argType)}" must not be null.`, 
          [argumentNode.value]
        );
      } else if (argumentNode && argumentNode.value.kind === Kind.VARIABLE) {
        var _variableName = argumentNode.value.name.value;
        throw new GraphQLError("Argument \"".concat(name, "\" of required type \"").concat(inspect(argType), "\" ") + "was provided the variable \"$".concat(_variableName, "\" ") + 'which was not provided a runtime value.', [argumentNode.value]);
      } else {
        throw new GraphQLError("Argument \"".concat(name, "\" of required type \"").concat(inspect(argType), "\" ") + 'was not provided.', [node]);
      }
    } else if (hasValue) {
      if (argumentNode.value.kind === Kind.NULL) {
        // If the explicit value `null` was provided, an entry in the coerced
        // values must exist as the value `null`.
        coercedValues[name] = null;
      } else if (argumentNode.value.kind === Kind.VARIABLE) {
        var _variableName2 = argumentNode.value.name.value;
        !variableValues ? assert(0, 'Must exist for hasValue to be true.') : void 0; // Note: This does no further checking that this variable is correct.
        // This assumes that this query has been validated and the variable
        // usage here is of the correct type.

        coercedValues[name] = variableValues[_variableName2];
      } else {
        var valueNode = argumentNode.value;
        var coercedValue = valueFromAST(valueNode, argType, variableValues);

        if (coercedValue === undefined) {
          // Note: ValuesOfCorrectType validation should catch this before
          // execution. This is a runtime check to ensure execution does not
          // continue with an invalid argument value.
          throw new GraphQLError(
            "Argument \"".concat(name, "\" has invalid value ").concat(print(valueNode), "."), 
            [argumentNode.value]
          );
        }

        coercedValues[name] = coercedValue;
      }
    }
  }

  return coercedValues;
}
