/**
 *
 *
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
  }

  return device;
}
