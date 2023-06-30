/**
 * *****************************************************************************
 *
 * Given two schemas, returns an Array containing descriptions of all the types
 * of breaking changes covered by the other functions down below.
 *
 * *****************************************************************************
 */

import { findRemovedTypes } from './findRemovedTypes.mjs';
import { findTypesThatChangedKind } from './findTypesThatChangedKind.mjs';
import { findFieldsThatChangedTypeOnObjectOrInterfaceTypes 
} from './findFieldsThatChangedTypeOnObjectOrInterfaceTypes.mjs';
import { findFieldsThatChangedTypeOnInputObjectTypes
} from './findFieldsThatChangedTypeOnInputObjectTypes.mjs';
import { findTypesRemovedFromUnions } from './findTypesRemovedFromUnions.mjs';
import { findValuesRemovedFromEnums } from './findValuesRemovedFromEnums.mjs';
import { findArgChanges } from './findArgChanges.mjs';
import { findInterfacesRemovedFromObjectTypes } from './findInterfacesRemovedFromObjectTypes.mjs';
import { findRemovedDirectives } from './findRemovedDirectives.mjs';
import { findRemovedDirectiveArgs } from './findRemovedDirectiveArgs.mjs';
import { findAddedNonNullDirectiveArgs } from './findAddedNonNullDirectiveArgs.mjs';
import { findRemovedDirectiveLocations } from './findRemovedDirectiveLocations.mjs';

export function findBreakingChanges(oldSchema, newSchema) {
  return [].concat(
    findRemovedTypes(oldSchema, newSchema), 
    findTypesThatChangedKind(oldSchema, newSchema),
    findFieldsThatChangedTypeOnObjectOrInterfaceTypes(oldSchema, newSchema),
    findFieldsThatChangedTypeOnInputObjectTypes(oldSchema, newSchema).breakingChanges, 
    findTypesRemovedFromUnions(oldSchema, newSchema),
    findValuesRemovedFromEnums(oldSchema, newSchema), 
    findArgChanges(oldSchema, newSchema).breakingChanges,
    findInterfacesRemovedFromObjectTypes(oldSchema, newSchema),
    findRemovedDirectives(oldSchema, newSchema),
    findRemovedDirectiveArgs(oldSchema, newSchema),
    findAddedNonNullDirectiveArgs(oldSchema, newSchema),
    findRemovedDirectiveLocations(oldSchema, newSchema)
  );
}
