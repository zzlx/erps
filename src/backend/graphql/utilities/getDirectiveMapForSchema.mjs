import { keyMap } from '../../utils.lib.mjs';

export function getDirectiveMapForSchema(schema) {
  return keyMap(schema.getDirectives(), dir => dir.name);
}
