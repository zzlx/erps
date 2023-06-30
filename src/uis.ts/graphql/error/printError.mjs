/**
 *
 * Prints a GraphQLError to a string, 
 * representing useful location information 
 * about the error's position in the source.
 *
 */

import { getLocation } from '../language/index.mjs';

export function printError(error) {
  var printedLocations = [];

  if (error.nodes) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = error.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var node = _step.value;

        if (node.loc) {
          printedLocations.push(highlightSourceAtLocation(node.loc.source, getLocation(node.loc.source, node.loc.start)));
        }
      }
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
  } else if (error.source && error.locations) {
    var source = error.source;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = error.locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var location = _step2.value;
        printedLocations.push(highlightSourceAtLocation(source, location));
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

  return printedLocations.length === 0 
    ? error.message 
    : [error.message].concat(printedLocations).join('\n\n') + '\n';
}

/**
 * Render a helpful description of the location of the error in the GraphQL
 * Source document.
 */

function highlightSourceAtLocation(source, location) {
  const firstLineColumnOffset = source.locationOffset.column - 1;
  const body = whitespace(firstLineColumnOffset) + source.body;
  const lineIndex = location.line - 1;
  const lineOffset = source.locationOffset.line - 1;
  const lineNum = location.line + lineOffset;
  const columnOffset = location.line === 1 ? firstLineColumnOffset : 0;
  const columnNum = location.column + columnOffset;
  const lines = body.split(/\r\n|[\n\r]/g);

  return "".concat(source.name, " (").concat(lineNum, ":").concat(columnNum, ")\n") + printPrefixedLines([// Lines specified like this: ["prefix", "string"],
  ["".concat(lineNum - 1, ": "), lines[lineIndex - 1]], ["".concat(lineNum, ": "), lines[lineIndex]], ['', whitespace(columnNum - 1) + '^'], ["".concat(lineNum + 1, ": "), lines[lineIndex + 1]]]);

  return "".concat(source.name, " (")
  .concat(lineNum, ":")
  .concat(columnNum, ")\n") + printPrefixedLines([
  ["".concat(lineNum - 1, ": "), lines[lineIndex - 1]], 
  ["".concat(lineNum, ": "), lines[lineIndex]], 
  ['', whitespace(columnNum - 1) + '^'], 
  ["".concat(lineNum + 1, ": "), lines[lineIndex + 1]]
  ]);
}

function printPrefixedLines(lines) {
  const existingLines = lines.filter(function (_ref) {
    const _ = _ref[0];
    const line = _ref[1];
    return line !== undefined;
  });

  let padLen = 0;
  let _iteratorNormalCompletion3 = true;
  let _didIteratorError3 = false;
  let _iteratorError3 = undefined;

  try {
    for (
      let _iterator3 = existingLines[Symbol.iterator](), _step3; 
      !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done);
      _iteratorNormalCompletion3 = true
    ) {
      const _ref4 = _step3.value;
      const prefix = _ref4[0];
      padLen = Math.max(padLen, prefix.length);
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

  return existingLines.map(function (_ref3) {
    const prefix = _ref3[0];
    const line = _ref3[1];
    return lpad(padLen, prefix) + line;
  }).join('\n');
}

function whitespace(len) {
  return Array(len + 1).join(' ');
}

// left
function lpad(len, str) {
  return whitespace(len - str.length) + str;
}
