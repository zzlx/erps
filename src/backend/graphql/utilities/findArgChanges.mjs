/**
 * Given two schemas, returns an Array containing descriptions of any
 * breaking or dangerous changes in the newSchema related to arguments
 * (such as removal or change of type of an argument, or a change in an
 * argument's default value).
 */

export function findArgChanges(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var breakingChanges = [];
  var dangerousChanges = [];

  var _arr3 = Object.keys(oldTypeMap);

  for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
    var typeName = _arr3[_i3];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!(isObjectType(oldType) || isInterfaceType(oldType)) || !(isObjectType(newType) || isInterfaceType(newType)) || newType.constructor !== oldType.constructor) {
      continue;
    }

    var oldTypeFields = oldType.getFields();
    var newTypeFields = newType.getFields();

    var _arr4 = Object.keys(oldTypeFields);

    for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
      var fieldName = _arr4[_i4];

      if (!newTypeFields[fieldName]) {
        continue;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var oldArgDef = _step.value;
          var newArgs = newTypeFields[fieldName].args;
          var newArgDef = newArgs.find(function (arg) {
            return arg.name === oldArgDef.name;
          }); // Arg not present

          if (!newArgDef) {
            breakingChanges.push({
              type: BreakingChangeType.ARG_REMOVED,
              description: "".concat(oldType.name, ".").concat(fieldName, " arg ") + "".concat(oldArgDef.name, " was removed")
            });
          } else {
            var isSafe = isChangeSafeForInputObjectFieldOrFieldArg(oldArgDef.type, newArgDef.type);

            if (!isSafe) {
              breakingChanges.push({
                type: BreakingChangeType.ARG_CHANGED_KIND,
                description: "".concat(oldType.name, ".").concat(fieldName, " arg ") + "".concat(oldArgDef.name, " has changed type from ") + "".concat(oldArgDef.type.toString(), " to ").concat(newArgDef.type.toString())
              });
            } else if (oldArgDef.defaultValue !== undefined && oldArgDef.defaultValue !== newArgDef.defaultValue) {
              dangerousChanges.push({
                type: DangerousChangeType.ARG_DEFAULT_VALUE_CHANGE,
                description: "".concat(oldType.name, ".").concat(fieldName, " arg ") + "".concat(oldArgDef.name, " has changed defaultValue")
              });
            }
          }
        };

        for (var _iterator = oldTypeFields[fieldName].args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        } // Check if arg was added to the field

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop2 = function _loop2() {
          var newArgDef = _step2.value;
          var oldArgs = oldTypeFields[fieldName].args;
          var oldArgDef = oldArgs.find(function (arg) {
            return arg.name === newArgDef.name;
          });

          if (!oldArgDef) {
            var argName = newArgDef.name;

            if (isRequiredArgument(newArgDef)) {
              breakingChanges.push({
                type: BreakingChangeType.REQUIRED_ARG_ADDED,
                description: "A required arg ".concat(argName, " on ") + "".concat(typeName, ".").concat(fieldName, " was added")
              });
            } else {
              dangerousChanges.push({
                type: DangerousChangeType.OPTIONAL_ARG_ADDED,
                description: "An optional arg ".concat(argName, " on ") + "".concat(typeName, ".").concat(fieldName, " was added")
              });
            }
          }
        };

        for (var _iterator2 = newTypeFields[fieldName].args[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }

  return {
    breakingChanges: breakingChanges,
    dangerousChanges: dangerousChanges
  };
}
