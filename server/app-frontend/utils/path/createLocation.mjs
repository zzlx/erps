/**
 * *****************************************************************************
 *
 * create loaction
 *
 * *****************************************************************************
 */

import { urlParser } from './urlParser.mjs';
import { resolvePathname } from './resolvePathname.mjs';

export function createLocation(path, state, key, currentLocation) {
  let location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = urlParser(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = Object.assign({}, path);

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
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(
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
