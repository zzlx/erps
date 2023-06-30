import { keyMap } from '../../utils/keyMap.mjs';

export function getArgumentMapForDirective(directive) {
  return keyMap(directive.args, arg => arg.name);
}
