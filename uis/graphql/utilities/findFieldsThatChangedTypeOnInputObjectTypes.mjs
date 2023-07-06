export function findFieldsThatChangedTypeOnInputObjectTypes(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];
  var dangerousChanges = [];

  var _arr7 = Object.keys(oldTypeMap);

  for (var _i7 = 0; _i7 < _arr7.length; _i7++) {
    var typeName = _arr7[_i7];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isInputObjectType(oldType) || !isInputObjectType(newType)) {
      continue;
    }

    var oldTypeFieldsDef = oldType.getFields();
    var newTypeFieldsDef = newType.getFields();

    var _arr8 = Object.keys(oldTypeFieldsDef);

    for (var _i8 = 0; _i8 < _arr8.length; _i8++) {
      var fieldName = _arr8[_i8];

      // Check if the field is missing on the type in the new schema.
      if (!(fieldName in newTypeFieldsDef)) {
        breakingChanges.push({
          type: BreakingChangeType.FIELD_REMOVED,
          description: "".concat(typeName, ".").concat(fieldName, " was removed.")
        });
      } else {
        var oldFieldType = oldTypeFieldsDef[fieldName].type;
        var newFieldType = newTypeFieldsDef[fieldName].type;
        var isSafe = isChangeSafeForInputObjectFieldOrFieldArg(oldFieldType, newFieldType);

        if (!isSafe) {
          var oldFieldTypeString = isNamedType(oldFieldType) ? oldFieldType.name : oldFieldType.toString();
          var newFieldTypeString = isNamedType(newFieldType) ? newFieldType.name : newFieldType.toString();
          breakingChanges.push({
            type: BreakingChangeType.FIELD_CHANGED_KIND,
            description: "".concat(typeName, ".").concat(fieldName, " changed type from ") + "".concat(oldFieldTypeString, " to ").concat(newFieldTypeString, ".")
          });
        }
      }
    } // Check if a field was added to the input object type


    var _arr9 = Object.keys(newTypeFieldsDef);

    for (var _i9 = 0; _i9 < _arr9.length; _i9++) {
      var _fieldName = _arr9[_i9];

      if (!(_fieldName in oldTypeFieldsDef)) {
        if (isRequiredInputField(newTypeFieldsDef[_fieldName])) {
          breakingChanges.push({
            type: BreakingChangeType.REQUIRED_INPUT_FIELD_ADDED,
            description: "A required field ".concat(_fieldName, " on ") + "input type ".concat(typeName, " was added.")
          });
        } else {
          dangerousChanges.push({
            type: DangerousChangeType.OPTIONAL_INPUT_FIELD_ADDED,
            description: "An optional field ".concat(_fieldName, " on ") + "input type ".concat(typeName, " was added.")
          });
        }
      }
    }
  }

  return {
    breakingChanges: breakingChanges,
    dangerousChanges: dangerousChanges
  };
}
