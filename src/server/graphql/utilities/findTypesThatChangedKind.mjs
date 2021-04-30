/**
 * Given two schemas, returns an Array containing descriptions of any breaking
 * changes in the newSchema related to changing the type of a type.
 */

export function findTypesThatChangedKind(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];

  var _arr2 = Object.keys(oldTypeMap);

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var typeName = _arr2[_i2];

    if (!newTypeMap[typeName]) {
      continue;
    }

    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (oldType.constructor !== newType.constructor) {
      breakingChanges.push({
        type: BreakingChangeType.TYPE_CHANGED_KIND,
        description: "".concat(typeName, " changed from ") + "".concat(typeKindName(oldType), " to ").concat(typeKindName(newType), ".")
      });
    }
  }

  return breakingChanges;
}
