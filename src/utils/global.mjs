/**
 * *****************************************************************************
 *
 * 获取环境global对象
 *
 * *****************************************************************************
 */

function getGlobal () {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  if (typeof global !== 'undefined') return global;
  return null;
}

export default getGlobal();
