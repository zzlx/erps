import { getArgumentMapForDirective } from './getArgumentMapForDirective.mjs';

export function findAddedArgsForDirective(oldDirective, newDirective) {
  var addedArgs = [];
  var oldArgMap = getArgumentMapForDirective(oldDirective);
  var _iteratorNormalCompletion17 = true;
  var _didIteratorError17 = false;
  var _iteratorError17 = undefined;

  try {
    for (var _iterator17 = newDirective.args[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
      var arg = _step17.value;

      if (!oldArgMap[arg.name]) {
        addedArgs.push(arg);
      }
    }
  } catch (err) {
    _didIteratorError17 = true;
    _iteratorError17 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
        _iterator17.return();
      }
    } finally {
      if (_didIteratorError17) {
        throw _iteratorError17;
      }
    }
  }

  return addedArgs;
}
