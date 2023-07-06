/**
 * Given two schemas, returns an Array containing descriptions of any breaking
 * changes in the newSchema related to removing an entire type.
 */

export function findRemovedTypes(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];

  var _arr = Object.keys(oldTypeMap);

  for (var _i = 0; _i < _arr.length; _i++) {
    var typeName = _arr[_i];

    if (!newTypeMap[typeName]) {
      breakingChanges.push({
        type: BreakingChangeType.TYPE_REMOVED,
        description: "".concat(typeName, " was removed.")
      });
    }
  }

  return breakingChanges;
}
