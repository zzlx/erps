/**
 * *****************************************************************************
 *
 * Given two schemas, returns an Array containing descriptions of all the types
 * of potentially dangerous changes covered by the other functions down below.
 *
 * *****************************************************************************
 */

import { findArgChanges } from './findArgChanges.mjs';
import { findValuesAddedToEnums } from './findValuesAddedToEnums.mjs';

export function findDangerousChanges(oldSchema, newSchema) {
  return [].concat(
    findArgChanges(oldSchema, newSchema).dangerousChanges,
    findValuesAddedToEnums(oldSchema, newSchema), 
    findInterfacesAddedToObjectTypes(oldSchema, newSchema), 
    findTypesAddedToUnions(oldSchema, newSchema), 
    findFieldsThatChangedTypeOnInputObjectTypes(oldSchema, newSchema).dangerousChanges
  );
}
