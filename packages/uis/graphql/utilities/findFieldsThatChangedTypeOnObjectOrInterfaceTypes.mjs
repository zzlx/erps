export function findFieldsThatChangedTypeOnObjectOrInterfaceTypes(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];

  var _arr5 = Object.keys(oldTypeMap);

  for (var _i5 = 0; _i5 < _arr5.length; _i5++) {
    var typeName = _arr5[_i5];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!(isObjectType(oldType) || isInterfaceType(oldType)) || !(isObjectType(newType) || isInterfaceType(newType)) || newType.constructor !== oldType.constructor) {
      continue;
    }

    var oldTypeFieldsDef = oldType.getFields();
    var newTypeFieldsDef = newType.getFields();

    var _arr6 = Object.keys(oldTypeFieldsDef);

    for (var _i6 = 0; _i6 < _arr6.length; _i6++) {
      var fieldName = _arr6[_i6];

      // Check if the field is missing on the type in the new schema.
      if (!(fieldName in newTypeFieldsDef)) {
        breakingChanges.push({
          type: BreakingChangeType.FIELD_REMOVED,
          description: "".concat(typeName, ".").concat(fieldName, " was removed.")
        });
      } else {
        var oldFieldType = oldTypeFieldsDef[fieldName].type;
        var newFieldType = newTypeFieldsDef[fieldName].type;
        var isSafe = isChangeSafeForObjectOrInterfaceField(oldFieldType, newFieldType);

        if (!isSafe) {
          var oldFieldTypeString = isNamedType(oldFieldType) ? oldFieldType.name : oldFieldType.toString();
          var newFieldTypeString = isNamedType(newFieldType) ? newFieldType.name : newFieldType.toString();
          breakingChanges.push({
            type: BreakingChangeType.FIELD_CHANGED_KIND,
            description: "".concat(typeName, ".").concat(fieldName, " changed type from ") + "".concat(oldFieldTypeString, " to ").concat(newFieldTypeString, ".")
          });
        }
      }
    }
  }

  return breakingChanges;
}
