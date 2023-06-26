/**
 * *****************************************************************************
 *
 * Values
 *
 * *****************************************************************************
 */

import { inspect } from '../../utils/inspect.mjs';
import { keyMap } from '../../utils/keyMap.mjs';

import { coerceValue } from '../utilities/coerceValue.mjs';
import { typeFromAST } from '../utilities/typeFromAST.mjs';
import { valueFromAST } from '../utilities/valueFromAST.mjs';

import { Kind, print } from '../language/index.mjs';
import { GraphQLError } from '../error/index.mjs';
import { isInputType, isNonNullType } from '../type/index.mjs';

/**
 * Prepares an object map of variableValues of the correct type 
 * based on the provided variable definitions and arbitrary input.
 * If the input cannot be parsed to match the variable definitions, 
 * a GraphQLError will be thrown.
 *
 * Note: 
 * The returned value is a plain Object with a prototype, 
 * since it is exposed to user code. 
 * Care should be taken to not pull values from the Object prototype.
 */

export function getVariableValues(schema, varDefNodes, inputs) {
  const errors = [];
  const coercedValues = {};

  for (let i = 0; i < varDefNodes.length; i++) {
    var varDefNode = varDefNodes[i];
    var varName = varDefNode.variable.name.value;
    var varType = typeFromAST(schema, varDefNode.type);

    if (!isInputType(varType)) {
      // Must use input types for variables. This should be caught during
      // validation, however is checked again here for safety.
      errors.push(new GraphQLError(
        "Variable \"$".concat(varName, "\" expected value of type ") + 
        "\"".concat(print(varDefNode.type), "\" which cannot be used as an input type."),
        [varDefNode.type]
      ));
    } else {
      const hasValue = inputs.hasOwnProperty(varName);
      const value = hasValue ? inputs[varName] : undefined;

      if (!hasValue && varDefNode.defaultValue) {
        // If no value was provided to a variable with a default value,
        // use the default value.
        coercedValues[varName] = valueFromAST(varDefNode.defaultValue, varType);
      } else if ((!hasValue || value === null) && isNonNullType(varType)) {
        // If no value or a nullish value was provided to a variable with a
        // non-null type (required), produce an error.
        errors.push(new GraphQLError(
          hasValue 
            ? "Variable \"$".concat(varName, "\" of non-null type ") + 
              "\"".concat(inspect(varType), "\" must not be null.") 
            : "Variable \"$".concat(varName, "\" of required type ") + 
              "\"".concat(inspect(varType), "\" was not provided."), 
            [varDefNode]
          ));
      } else if (hasValue) {
        if (value === null) {
          // If the explicit value `null` was provided, an entry in the coerced
          // values must exist as the value `null`.
          coercedValues[varName] = null;
        } else {
          // Otherwise, a non-null value was provided, 
          // coerce it to the expected type or report an error if coercion fails.
          var coerced = coerceValue(value, varType, varDefNode);
          var coercionErrors = coerced.errors;

          if (coercionErrors) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (
                var _iterator = coercionErrors[Symbol.iterator](), _step; 
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
              ) {
                var error = _step.value;
                error.message = "Variable \"$".concat(varName, "\" got invalid value ").concat(inspect(value), "; ") + error.message;
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            errors.push.apply(errors, coercionErrors);
          } else {
            coercedValues[varName] = coerced.value;
          }
        }
      }
    }
  }

  return errors.length === 0 
    ? { errors: undefined, coerced: coercedValues } 
    : { errors: errors, coerced: undefined };
}


/**
 * Prepares an object map of argument values given a directive definition
 * and a AST node which may contain directives. 
 * Optionally also accepts a map of variable values.
 *
 * If the directive does not exist on the node, returns undefined.
 *
 * Note: 
 * The returned value is a plain Object with a prototype, since it is exposed to user code.
 * Care should be taken to not pull values from the Object prototype.
 */

export function getDirectiveValues(directiveDef, node, variableValues) {
  const directiveNode = node.directives && Array.prototype.find.call(
    node.directives, 
    directive => directive.name.value === directiveDef.name
  );

  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues);
  }
}
