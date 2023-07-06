/**
 * Given two schemas, returns an Array containing descriptions of any dangerous
 * changes in the newSchema related to adding types to a union type.
 */

export function findTypesAddedToUnions(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var typesAddedToUnion = [];

  var _arr11 = Object.keys(newTypeMap);

  for (var _i11 = 0; _i11 < _arr11.length; _i11++) {
    var typeName = _arr11[_i11];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isUnionType(oldType) || !isUnionType(newType)) {
      continue;
    }

    var typeNamesInOldUnion = Object.create(null);
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = oldType.getTypes()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var type = _step5.value;
        typeNamesInOldUnion[type.name] = true;
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = newType.getTypes()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var _type2 = _step6.value;

        if (!typeNamesInOldUnion[_type2.name]) {
          typesAddedToUnion.push({
            type: DangerousChangeType.TYPE_ADDED_TO_UNION,
            description: "".concat(_type2.name, " was added to union type ").concat(typeName, ".")
          });
        }
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }

  return typesAddedToUnion;
}
