/**
 * *****************************************************************************
 *
 * Donvert ascii to binary
 *
 * *****************************************************************************
 */

import { atob } from './atob.mjs';

export function decode (base64, url_safe = false) {
  if (url_safe) {
    base64 = base64
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/[^A-Za-z0-9\+\/]/g, '');
  }

  return atob(base64);
}
