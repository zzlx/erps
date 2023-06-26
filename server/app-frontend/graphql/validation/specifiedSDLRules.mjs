import { LoneSchemaDefinition } from './rules/LoneSchemaDefinition.mjs';
import { UniqueOperationTypes } from './rules/UniqueOperationTypes.mjs';
import { UniqueTypeNames } from './rules/UniqueTypeNames.mjs';
import { UniqueEnumValueNames } from './rules/UniqueEnumValueNames.mjs';
import { UniqueFieldDefinitionNames } from './rules/UniqueFieldDefinitionNames.mjs';
import { UniqueDirectiveNames } from './rules/UniqueDirectiveNames.mjs';
import { KnownTypeNames } from './rules/KnownTypeNames.mjs';
import { KnownDirectives } from './rules/KnownDirectives.mjs';
import { UniqueDirectivesPerLocation } from './rules/UniqueDirectivesPerLocation.mjs';
import { PossibleTypeExtensions } from './rules/PossibleTypeExtensions.mjs';
import { KnownArgumentNamesOnDirectives } from './rules/KnownArgumentNames.mjs';
import { UniqueArgumentNames } from './rules/UniqueArgumentNames.mjs';
import { UniqueInputFieldNames } from './rules/UniqueInputFieldNames.mjs'; // @internal
import { ProvidedRequiredArgumentsOnDirectives } from './rules/ProvidedRequiredArguments.mjs';

export const specifiedSDLRules = [

  LoneSchemaDefinition, 
  UniqueOperationTypes, 
  UniqueTypeNames, 
  UniqueEnumValueNames, 
  UniqueFieldDefinitionNames, 
  UniqueDirectiveNames, 

  KnownTypeNames, 
  KnownDirectives, 
  UniqueDirectivesPerLocation, 

  PossibleTypeExtensions, 
  KnownArgumentNamesOnDirectives, 

  UniqueArgumentNames, 
  UniqueInputFieldNames, 

  ProvidedRequiredArgumentsOnDirectives
];
