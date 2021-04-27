import { LoneSchemaDefinition } from './rules/LoneSchemaDefinition.mjs';
import { UniqueOperationTypes } from './rules/UniqueOperationTypes.mjs';
import { UniqueTypeNames } from './rules/UniqueTypeNames.mjs';
import { UniqueEnumValueNames } from './rules/UniqueEnumValueNames.mjs';
import { UniqueFieldDefinitionNames } from './rules/UniqueFieldDefinitionNames.mjs';
import { UniqueDirectiveNames } from './rules/UniqueDirectiveNames.mjs';
import { PossibleTypeExtensions } from './rules/PossibleTypeExtensions.mjs';
import { KnownArgumentNamesOnDirectives } from './rules/KnownArgumentNames.mjs';
import { ProvidedRequiredArgumentsOnDirectives } from './rules/ProvidedRequiredArguments.mjs'; // @internal

export const specifiedSDLRules = [LoneSchemaDefinition, UniqueOperationTypes, UniqueTypeNames, UniqueEnumValueNames, UniqueFieldDefinitionNames, UniqueDirectiveNames, KnownTypeNames, KnownDirectives, UniqueDirectivesPerLocation, PossibleTypeExtensions, KnownArgumentNamesOnDirectives, UniqueArgumentNames, UniqueInputFieldNames, ProvidedRequiredArgumentsOnDirectives];
