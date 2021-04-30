export function findRemovedDirectives(oldSchema, newSchema) {
  var removedDirectives = [];
  var newSchemaDirectiveMap = getDirectiveMapForSchema(newSchema);
  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = oldSchema.getDirectives()[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var directive = _step13.value;

      if (!newSchemaDirectiveMap[directive.name]) {
        removedDirectives.push({
          type: BreakingChangeType.DIRECTIVE_REMOVED,
          description: "".concat(directive.name, " was removed")
        });
      }
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }

  return removedDirectives;
}
