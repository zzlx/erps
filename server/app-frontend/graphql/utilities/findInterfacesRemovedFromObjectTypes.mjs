export function findInterfacesRemovedFromObjectTypes(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];

  var _arr14 = Object.keys(oldTypeMap);

  for (var _i14 = 0; _i14 < _arr14.length; _i14++) {
    var typeName = _arr14[_i14];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isObjectType(oldType) || !isObjectType(newType)) {
      continue;
    }

    var oldInterfaces = oldType.getInterfaces();
    var newInterfaces = newType.getInterfaces();
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      var _loop3 = function _loop3() {
        var oldInterface = _step11.value;

        if (!newInterfaces.some(function (int) {
          return int.name === oldInterface.name;
        })) {
          breakingChanges.push({
            type: BreakingChangeType.INTERFACE_REMOVED_FROM_OBJECT,
            description: "".concat(typeName, " no longer implements interface ") + "".concat(oldInterface.name, ".")
          });
        }
      };

      for (var _iterator11 = oldInterfaces[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        _loop3();
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }
  }

  return breakingChanges;
}
