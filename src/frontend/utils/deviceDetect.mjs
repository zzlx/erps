/**
 * *****************************************************************************
 *
 * 根据提供的ua字符串,解析出设备、浏览器客户端类型
 *
 * *****************************************************************************
 */

export default function deviceDetect (ua) {
  let device = null;

  if (/iPhone;/.test(ua)) {
    device = 'iPhone';
  } else if (/iPad;/.test(ua)) {
    device = 'iPad';
  } else if (/Android/.test(ua)) {
    device = 'android';
  } else if (/Intel Mac OS X/.test(ua)) {
    device = 'Mac';
  } else if (/Windows NT/.test(ua)) {
    device = 'Windows';
  }

  return device;
}
