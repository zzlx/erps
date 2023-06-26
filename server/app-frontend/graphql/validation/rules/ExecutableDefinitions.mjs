/**
 * Executable definitions
 *
 * A GraphQL document is only valid for execution if all definitions are either
 * operation or fragment definitions.
 *
 *
 *
 */

import { GraphQLError } from '../../error/index.mjs';
import { Kind } from '../../language/index.mjs';
import { isExecutableDefinitionNode } from '../../language/index.mjs';

export function nonExecutableDefinitionMessage(defName) {
  return "The ".concat(defName, " definition is not executable.");
}

export function ExecutableDefinitions(context) {
  return {
    Document: function Document(node) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.definitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var definition = _step.value;

          if (!isExecutableDefinitionNode(definition)) {
            context.reportError(new GraphQLError(nonExecutableDefinitionMessage(definition.kind === Kind.SCHEMA_DEFINITION || definition.kind === Kind.SCHEMA_EXTENSION ? 'schema' : definition.name.value), [definition]));
          }
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

      return false;
    }
  };
}
