/**
 * *****************************************************************************
 *
 *
 * *****************************************************************************
 */

import { urlParser } from './urlParser.mjs';

export function createLocation(path, state, key, currentLocation) {
  let location = void 0;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = urlParser(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = Object.assign({}, path);

    // set pathname
    if (location.pathname === undefined) location.pathname = '';

    // set search
    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    // set hash
    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError(
        'pathname "' + location.pathname + '" could not be decoded. ' + 
        'This is likely caused by an invalid percent-encoding.'
      );
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  // 
  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      // 获取相对pathname
      location.pathname = Path.resolvePathname(
        location.pathname, 
        currentLocation.pathname
      );
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

