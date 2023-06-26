import { keyMap } from '../../utils/keyMap.mjs';

export function getDirectiveMapForSchema(schema) {
  return keyMap(schema.getDirectives(), dir => dir.name);
}
