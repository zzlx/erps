/**
 * 获取环境global对象
 */

export default (function () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  if (typeof global !== 'undefined') return global;
  throw new Error('无法获取到global.');
})();
