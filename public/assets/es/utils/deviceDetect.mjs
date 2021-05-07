/**
 * *****************************************************************************
 *
 * 根据提供的ua字符串,解析出设备、浏览器客户端类型
 *
 * *****************************************************************************
 */

export function deviceDetect (ua) {
  let platform = null, browser = null;

  if (/iPhone;/.test(ua)) {
    const v = /\(iPhone; CPU iPhone OS (\d{1,2})_(\d{1,2})_(\d{1,2}) like Mac OS X\)/g.exec(ua);
    platform = `iPhone ${v[1]}.${v[2]}.${v[3]}`;
    if (/Safari\/\d{1,3}.\d{1,3}/.test(ua)) {
      browser = 'Safari';
    }
  } else if (/iPad;/.test(ua)) {
    platform = 'iPad';
  } else if (/Android/.test(ua)) {
    platform = 'android';
  } else if (/Intel Mac OS X/.test(ua)) {
    platform = 'Mac';
  } else if (/Windows NT/.test(ua)) {
    const v = /\(Windows NT \d{1,2}.\d{1,2}; Win64; x64\)/g.exec(ua);
    platform = `Windows ${v[1]}.${v[2]}`;

    if (/Edg\/90.0.818.51/.test(ua)) {
      browser = 'Edg';
    } else if (/Firefox\/\d{1,2}.\d{1,2}/.test(ua)) {
      browser = 'Firefox';
    }
  }

  return {
    platform,
    browser,
  };
}
