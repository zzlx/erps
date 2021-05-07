/**
 * Given two schemas, returns an Array containing descriptions of any breaking
 * changes in the newSchema related to removing types from a union type.
 */


export function findTypesRemovedFromUnions(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var typesRemovedFromUnion = [];

  var _arr10 = Object.keys(oldTypeMap);

  for (var _i10 = 0; _i10 < _arr10.length; _i10++) {
    var typeName = _arr10[_i10];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isUnionType(oldType) || !isUnionType(newType)) {
      continue;
    }

    var typeNamesInNewUnion = Object.create(null);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = newType.getTypes()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var type = _step3.value;
        typeNamesInNewUnion[type.name] = true;
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = oldType.getTypes()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var _type = _step4.value;

        if (!typeNamesInNewUnion[_type.name]) {
          typesRemovedFromUnion.push({
            type: BreakingChangeType.TYPE_REMOVED_FROM_UNION,
            description: "".concat(_type.name, " was removed from union type ").concat(typeName, ".")
          });
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  return typesRemovedFromUnion;
}
