/**
 * *****************************************************************************
 *
 * Detect device access userAgent string
 *
 * @param {string} ua user agent strings
 *
 * *****************************************************************************
 */

export function deviceDetect (ua) {
  const u = globalThis.navigator != null ? navigator.userAgent : null;

  let platform, browser, device, version;

  if (/iPhone;/.test(ua)) {
    const v = /\(iPhone; CPU iPhone OS (\d{1,2})_(\d{1,2})_(\d{1,2}) like Mac OS X\)/g.exec(ua);
    device = 'iPhone';
    platform = `iPhone ${v[1]}.${v[2]}.${v[3]}`;
    if (/Safari\/\d{1,3}.\d{1,3}/.test(ua)) {
      browser = 'Safari';
    }
  } else if (/iPad;/.test(ua)) {
    device = 'iPad';
  } else if (/Android/.test(ua)) {
    device = 'Android';
  } else if (/Macintosh; /.test(ua)) {
    if (/Intel/.test(ua)) platform = 'Intel'
    device = 'Mac';
    if (/Safari/.test(ua)) { browser = 'Safari'; }
    if (/Firefox/.test(ua)) { browser = 'Firefox'; }
  } else if (/Windows NT/.test(ua)) {
    const v = /\(Windows NT (\d{1,2})\.(\d{1,2});/g.exec(ua);
    device = 'windows';
    platform = `Windows ${v[1]}.${v[2]}`;
    if (/Edg\/90.0.818.51/.test(ua)) {
      browser = 'Edge';
    } else if (/Firefox\/\d{1,2}\.\d{1,2}/.test(ua)) {
      browser = 'Firefox';
    }
  } else if (/MobileSafari\/\d{3}\.\d{1}/.test(ua)) {
    device = 'iPhone';
    browser = 'Safari';
  }

  return {
    device,
    platform,
    browser,
  };
}
