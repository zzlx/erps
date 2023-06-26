/**
 * *****************************************************************************
 *
 * 深拷贝
 *
 * *****************************************************************************
 */

import { isPlainObject } from './is/isPlainObject.mjs';

export const deepCopy = (target, hash = new WeakMap()) => {
  if (!isPlainObject(target)) return target; // 对于传入参数处理

  if (hash.has(target)) return hash.get(target);

  const cloneTarget = Array.isArray(target) ? [] : {};

  hash.set(target, cloneTarget);

  // 针对Symbol属性
  const symKeys = Object.getOwnPropertySymbols(target);

  if (symKeys.length) {
    symKeys.forEach(symKey => {
      if (isPlainObject(target[symKey])) {
        cloneTarget[symKey] = deepCopy(target[symKey]);
      } else {
        cloneTarget[symKey] = target[symKey];
      }
    })
  }

  // 遍历target
  for (const i in target) {
    if (Object.prototype.hasOwnProperty.call(target, i)) {
      cloneTarget[i] =
        typeof target[i] === 'object' && target[i] !== null
        ? deepCopy(target[i], hash)
        : target[i];
    }
  }

  return cloneTarget;
}

/**
 * 深拷贝另一种简单算法
 */

function _deepCopy (data) {
  const _data = JSON.stringify(data);
  return JSON.parse(_data);
}
