import { specifiedDirectives } from './specifiedDirectives.mjs';

export function isSpecifiedDirective(directive) {
  return specifiedDirectives.some(function (specifiedDirective) {
    return specifiedDirective.name === directive.name;
  });
}
