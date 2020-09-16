/**
 * *****************************************************************************
 *
 * 获取环境global对象
 *
 * *****************************************************************************
 */

export default (function getGlobal () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  if (typeof global !== 'undefined') return global;
  return Object.create(null);
})();
