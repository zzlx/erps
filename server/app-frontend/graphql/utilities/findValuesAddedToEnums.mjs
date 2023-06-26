/**
 * Given two schemas, returns an Array containing descriptions of any dangerous
 * changes in the newSchema related to adding values to an enum type.
 */

export function findValuesAddedToEnums(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var valuesAddedToEnums = [];

  var _arr13 = Object.keys(oldTypeMap);

  for (var _i13 = 0; _i13 < _arr13.length; _i13++) {
    var typeName = _arr13[_i13];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isEnumType(oldType) || !isEnumType(newType)) {
      continue;
    }

    var valuesInOldEnum = Object.create(null);
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = oldType.getValues()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        var value = _step9.value;
        valuesInOldEnum[value.name] = true;
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }

    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      for (var _iterator10 = newType.getValues()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        var _value2 = _step10.value;

        if (!valuesInOldEnum[_value2.name]) {
          valuesAddedToEnums.push({
            type: DangerousChangeType.VALUE_ADDED_TO_ENUM,
            description: "".concat(_value2.name, " was added to enum type ").concat(typeName, ".")
          });
        }
      }
    } catch (err) {
      _didIteratorError10 = true;
      _iteratorError10 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
          _iterator10.return();
        }
      } finally {
        if (_didIteratorError10) {
          throw _iteratorError10;
        }
      }
    }
  }

  return valuesAddedToEnums;
}
