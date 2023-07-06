/**
 * *****************************************************************************
 *
 * Complete an Object value by executing all sub-selections.
 *
 * *****************************************************************************
 */

import { isPromise } from '../../utils/isPromise.mjs';
import { GraphQLError } from '../error/GraphQLError.mjs';
import { memoize3 } from '../utilities/memoize3.mjs';

export function completeObjectValue(
  context, returnType, fieldNodes, info, path, result
) {
  // If there is an isTypeOf predicate function, call it with the
  // current result. If isTypeOf returns false, then raise an error rather
  // than continuing execution.
  if (returnType.isTypeOf) {
    const isTypeOf = returnType.isTypeOf(result, context.contextValue, info);

    if (isPromise(isTypeOf)) {
      return isTypeOf.then((resolvedIsTypeOf) => {
        if (!resolvedIsTypeOf) {
          throw invalidReturnTypeError(returnType, result, fieldNodes);
        }

        return collectAndExecuteSubfields(context, returnType, fieldNodes, path, result);
      });
    }

    if (!isTypeOf) {
      throw invalidReturnTypeError(returnType, result, fieldNodes);
    }
  }

  return collectAndExecuteSubfields(context, returnType, fieldNodes, path, result);
}

function invalidReturnTypeError(returnType, result, fieldNodes) {
  return new GraphQLError(
    "Expected value of type \"".concat(returnType.name, "\" but got: ").concat(inspect(result), "."), 
    fieldNodes
  );
}

function collectAndExecuteSubfields(context, returnType, fieldNodes, path, result) {
  // Collect sub-fields to execute to complete this value.
  const subFieldNodes = collectSubfields(context, returnType, fieldNodes);
  return executeFields(context, returnType, result, path, subFieldNodes);
}

/**
 * A memoized collection of relevant subfields with regard to the return type.
 * Memoizing ensures the subfields are not repeatedly calculated, 
 * which saves overhead when resolving lists of values.
 */

const collectSubfields = memoize3(_collectSubfields);

export function _collectSubfields(context, returnType, fieldNodes) {
  let subFieldNodes = Object.create(null);
  const visitedFragmentNames = Object.create(null);

  for (let i = 0; i < fieldNodes.length; i++) {
    const selectionSet = fieldNodes[i].selectionSet;

    if (selectionSet) {
      subFieldNodes = collectFields(
        context, returnType, selectionSet, subFieldNodes, visitedFragmentNames
      );
    }
  }

  return subFieldNodes;
}
