/**
 * *****************************************************************************
 *
 * copy text to clipboard
 *
 * *****************************************************************************
 */

export const copyToClipboard = (text) => {
  return globalThis.navigator 
    ? globalThis.navigator.clipboard.writeText(text)
    : null; 
}
