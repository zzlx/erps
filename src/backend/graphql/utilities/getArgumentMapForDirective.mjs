import { keyMap } from '../../utils.lib.mjs';

export function getArgumentMapForDirective(directive) {
  return keyMap(directive.args, arg => arg.name);
}
