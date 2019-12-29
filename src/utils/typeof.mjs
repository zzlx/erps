/**
 *
 *
 *
 *
 *
 *
 *
 */

export default function _typeof(obj) { 
  return typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? typeof obj 
    : obj && 
      typeof Symbol === "function" && 
      obj.constructor === Symbol && 
      obj !== Symbol.prototype 
      ? "symbol" 
      : typeof obj; 
}
