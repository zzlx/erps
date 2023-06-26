/**
 * Given two schemas, returns an Array containing descriptions of any breaking
 * changes in the newSchema related to removing values from an enum type.
 */

export function findValuesRemovedFromEnums(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var valuesRemovedFromEnums = [];

  var _arr12 = Object.keys(oldTypeMap);

  for (var _i12 = 0; _i12 < _arr12.length; _i12++) {
    var typeName = _arr12[_i12];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isEnumType(oldType) || !isEnumType(newType)) {
      continue;
    }

    var valuesInNewEnum = Object.create(null);
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = newType.getValues()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var value = _step7.value;
        valuesInNewEnum[value.name] = true;
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = oldType.getValues()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var _value = _step8.value;

        if (!valuesInNewEnum[_value.name]) {
          valuesRemovedFromEnums.push({
            type: BreakingChangeType.VALUE_REMOVED_FROM_ENUM,
            description: "".concat(_value.name, " was removed from enum type ").concat(typeName, ".")
          });
        }
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }
  }

  return valuesRemovedFromEnums;
}
