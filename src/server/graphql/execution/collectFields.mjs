/**
 * *****************************************************************************
 *
 * Given a selectionSet, 
 * adds all of the fields in that selection to the passed in map of fields, 
 * and returns it at the end.
 *
 * CollectFields requires the "runtime type" of an object. 
 * For a field which returns an Interface or Union type, 
 * the "runtime type" will be the actual Object type returned by that field.
 *
 * *****************************************************************************
 */

import { getFieldEntryKey } from './getFieldEntryKey.mjs';
import { shouldIncludeNode } from './shouldIncludeNode.mjs';
import { doesFragmentConditionMatch } from './doesFragmentConditionMatch.mjs';
import { Kind } from '../language/index.mjs';

export function collectFields(
  exeContext, 
  runtimeType, 
  selectionSet, 
  fields, 
  visitedFragmentNames
) {

  for (let i = 0; i < selectionSet.selections.length; i++) {
    const selection = selectionSet.selections[i];

    switch (selection.kind) {
      case Kind.FIELD:
        if (!shouldIncludeNode(exeContext, selection)) {
          continue;
        }

        const name = getFieldEntryKey(selection);

        if (!fields[name]) {
          fields[name] = [];
        }

        fields[name].push(selection);
        break;

      case Kind.INLINE_FRAGMENT:
        if (!shouldIncludeNode(exeContext, selection) || 
            !doesFragmentConditionMatch(exeContext, selection, runtimeType)
        ) {
          continue;
        }

        collectFields(
          exeContext, 
          runtimeType, 
          selection.selectionSet, 
          fields, 
          visitedFragmentNames
        );
        break;

      case Kind.FRAGMENT_SPREAD:
        const fragName = selection.name.value;

        if (visitedFragmentNames[fragName] || 
          !shouldIncludeNode(exeContext, selection)
        ) {
          continue;
        }

        visitedFragmentNames[fragName] = true;
        const fragment = exeContext.fragments[fragName];

        if (!fragment || 
          !doesFragmentConditionMatch(exeContext, fragment, runtimeType)
        ) {
          continue;
        }

        collectFields(
          exeContext, 
          runtimeType, 
          fragment.selectionSet, 
          fields, 
          visitedFragmentNames
        );
        break;
    }
  }

  return fields;
}
