export function findInterfacesAddedToObjectTypes(oldSchema, newSchema) {
  var oldTypeMap = oldSchema.getTypeMap();
  var newTypeMap = newSchema.getTypeMap();
  var interfacesAddedToObjectTypes = [];

  var _arr15 = Object.keys(newTypeMap);

  for (var _i15 = 0; _i15 < _arr15.length; _i15++) {
    var typeName = _arr15[_i15];
    var oldType = oldTypeMap[typeName];
    var newType = newTypeMap[typeName];

    if (!isObjectType(oldType) || !isObjectType(newType)) {
      continue;
    }

    var oldInterfaces = oldType.getInterfaces();
    var newInterfaces = newType.getInterfaces();
    var _iteratorNormalCompletion12 = true;
    var _didIteratorError12 = false;
    var _iteratorError12 = undefined;

    try {
      var _loop4 = function _loop4() {
        var newInterface = _step12.value;

        if (!oldInterfaces.some(function (int) {
          return int.name === newInterface.name;
        })) {
          interfacesAddedToObjectTypes.push({
            type: DangerousChangeType.INTERFACE_ADDED_TO_OBJECT,
            description: "".concat(newInterface.name, " added to interfaces implemented ") + "by ".concat(typeName, ".")
          });
        }
      };

      for (var _iterator12 = newInterfaces[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
        _loop4();
      }
    } catch (err) {
      _didIteratorError12 = true;
      _iteratorError12 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
          _iterator12.return();
        }
      } finally {
        if (_didIteratorError12) {
          throw _iteratorError12;
        }
      }
    }
  }

  return interfacesAddedToObjectTypes;
}
