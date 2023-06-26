/**
 * Accepts options as a second argument:
 *
 *    - commentDescriptions:
 *        Provide true to use preceding comments as the description.
 *
 */

import { assert } from '../../utils/assert.mjs';
import { astFromValue } from '../utilities/astFromValue.mjs';
import { print } from '../language/index.mjs';
import { 
  isScalarType, isObjectType, isInterfaceType, isUnionType, isEnumType, isInputObjectType,
  GraphQLString, isSpecifiedScalarType, 
  GraphQLDirective, DEFAULT_DEPRECATION_REASON, isSpecifiedDirective,
  isIntrospectionType,
} from '../type/index.mjs';

export function printIntrospectionSchema(schema, options) {
  return printFilteredSchema(schema, isSpecifiedDirective, isIntrospectionType, options);
}

function printFilteredSchema(schema, directiveFilter, typeFilter, options) {
  var directives = schema.getDirectives().filter(directiveFilter);
  var typeMap = schema.getTypeMap();
  var types = Object.values(typeMap).sort(function (type1, type2) {
    return type1.name.localeCompare(type2.name);
  }).filter(typeFilter);
  return [printSchemaDefinition(schema)].concat(directives.map(function (directive) {
    return printDirective(directive, options);
  }), types.map(function (type) {
    return printType(type, options);
  })).filter(Boolean).join('\n\n') + '\n';
}

function printSchemaDefinition(schema) {
  if (isSchemaOfCommonNames(schema)) {
    return;
  }

  var operationTypes = [];
  var queryType = schema.getQueryType();

  if (queryType) {
    operationTypes.push("  query: ".concat(queryType.name));
  }

  var mutationType = schema.getMutationType();

  if (mutationType) {
    operationTypes.push("  mutation: ".concat(mutationType.name));
  }

  var subscriptionType = schema.getSubscriptionType();

  if (subscriptionType) {
    operationTypes.push("  subscription: ".concat(subscriptionType.name));
  }

  return "schema {\n".concat(operationTypes.join('\n'), "\n}");
}
/**
 * GraphQL schema define root types for each type of operation. These types are
 * the same as any other type and can be named in any manner, however there is
 * a common naming convention:
 *
 *   schema {
 *     query: Query
 *     mutation: Mutation
 *   }
 *
 * When using this naming convention, the schema description can be omitted.
 */


function isSchemaOfCommonNames(schema) {
  var queryType = schema.getQueryType();

  if (queryType && queryType.name !== 'Query') {
    return false;
  }

  var mutationType = schema.getMutationType();

  if (mutationType && mutationType.name !== 'Mutation') {
    return false;
  }

  var subscriptionType = schema.getSubscriptionType();

  if (subscriptionType && subscriptionType.name !== 'Subscription') {
    return false;
  }

  return true;
}

function printArgs(options, args) {
  var indentation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  if (args.length === 0) {
    return '';
  } // If every arg does not have a description, print them on one line.


  if (args.every(function (arg) {
    return !arg.description;
  })) {
    return '(' + args.map(printInputValue).join(', ') + ')';
  }

  return '(\n' + args.map(function (arg, i) {
    return printDescription(options, arg, '  ' + indentation, !i) + '  ' + indentation + printInputValue(arg);
  }).join('\n') + '\n' + indentation + ')';
}

function printInputValue(arg) {
  var argDecl = arg.name + ': ' + String(arg.type);

  if (!assert.isInvalid(arg.defaultValue)) {
    argDecl += " = ".concat(print(astFromValue(arg.defaultValue, arg.type)));
  }

  return argDecl;
}

function printDirective(directive, options) {
  return printDescription(options, directive) + 'directive @' + directive.name + printArgs(options, directive.args) + ' on ' + directive.locations.join(' | ');
}

function printDeprecated(fieldOrEnumVal) {
  if (!fieldOrEnumVal.isDeprecated) {
    return '';
  }

  var reason = fieldOrEnumVal.deprecationReason;

  if (assert.isNullish(reason) || reason === '' || reason === DEFAULT_DEPRECATION_REASON) {
    return ' @deprecated';
  }

  return ' @deprecated(reason: ' + print(astFromValue(reason, GraphQLString)) + ')';
}

function printDescription(options, def) {
  var indentation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var firstInBlock = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  if (!def.description) {
    return '';
  }

  var lines = descriptionLines(def.description, 120 - indentation.length);

  if (options && options.commentDescriptions) {
    return printDescriptionWithComments(lines, indentation, firstInBlock);
  }

  var description = indentation && !firstInBlock ? '\n' + indentation + '"""' : indentation + '"""'; // In some circumstances, a single line can be used for the description.

  if (lines.length === 1 && lines[0].length < 70 && lines[0][lines[0].length - 1] !== '"') {
    return description + escapeQuote(lines[0]) + '"""\n';
  } // Format a multi-line block quote to account for leading space.


  var hasLeadingSpace = lines[0][0] === ' ' || lines[0][0] === '\t';

  if (!hasLeadingSpace) {
    description += '\n';
  }

  for (var i = 0; i < lines.length; i++) {
    if (i !== 0 || !hasLeadingSpace) {
      description += indentation;
    }

    description += escapeQuote(lines[i]) + '\n';
  }

  description += indentation + '"""\n';
  return description;
}

function escapeQuote(line) {
  return line.replace(/"""/g, '\\"""');
}

function printDescriptionWithComments(lines, indentation, firstInBlock) {
  let description = indentation && !firstInBlock ? '\n' : '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '') {
      description += indentation + '#\n';
    } else {
      description += indentation + '# ' + lines[i] + '\n';
    }
  }

  return description;
}

function descriptionLines(description, maxLen) {
  const lines = [];
  const rawLines = description.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    if (rawLines[i] === '') {
      lines.push(rawLines[i]);
    } else {
      // For > 120 character long lines, cut at space boundaries into sublines
      // of ~80 chars.
      var sublines = breakLine(rawLines[i], maxLen);

      for (var j = 0; j < sublines.length; j++) {
        lines.push(sublines[j]);
      }
    }
  }

  return lines;
}

function breakLine(line, maxLen) {
  if (line.length < maxLen + 5) {
    return [line];
  }

  var parts = line.split(new RegExp("((?: |^).{15,".concat(maxLen - 40, "}(?= |$))")));

  if (parts.length < 4) { return [line]; }

  var sublines = [parts[0] + parts[1] + parts[2]];

  for (var i = 3; i < parts.length; i += 2) {
    sublines.push(parts[i].slice(1) + parts[i + 1]);
  }

  return sublines;
}
