/**
 * *****************************************************************************
 *
 * Given an ast node, returns its string description.
 * @deprecated: provided to ease adoption and will be removed in v16.
 *
 * Accepts options as a second argument:
 *
 *    - commentDescriptions:
 *        Provide true to use preceding comments as the description.
 *
 * *****************************************************************************
 */

import { blockStringValue } from '../../utils/blockStringValue.mjs';

export function getDescription(node, options) {
  if (node.description) {
    return node.description.value;
  }

  if (options && options.commentDescriptions) {
    const rawValue = getLeadingCommentBlock(node);

    if (rawValue !== undefined) {
      return blockStringValue('\n' + rawValue);
    }
  }
}

function getLeadingCommentBlock(node) {
  const loc = node.loc;

  if (!loc) { return; }

  const comments = [];
  let token = loc.startToken.prev;

  while (token && token.kind === TokenKind.COMMENT && token.next && token.prev && 
    token.line + 1 === token.next.line && token.line !== token.prev.line) {
    const value = String(token.value);
    comments.push(value);
    token = token.prev;
  }

  return comments.reverse().join('\n');
}
