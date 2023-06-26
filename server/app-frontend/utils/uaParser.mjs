/**
 * *****************************************************************************
 *
 * ua解析器
 *
 * 从user_agent字符串中解析出设备信息
 *
 * @param {string} ua user agent字符串
 * @return {obj} retval 包含设备信息的对象
 *
 * *****************************************************************************
 */

export function uaParser (ua) {
  if (typeof ua !== 'string') throw new TypeError('Param ua must be a string.');

  // 构造设备信息的对象
  const retval = Object.create(null);

  if (/iPhone/.test(ua)) retval.device = 'iPhone'; // 设备信息
  if (/Mac/.test(ua)) retval.device = 'Mac'; // 设备信息
  if (/Safari/.test(ua)) retval.browser = 'Safari';  // 浏览器信息
  
  //ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1 ) && 
  //
  if (/Trident/i.exec(ua)) {
    const version = /Trident\/(\d{1,2})\.\d{1,2}/i.exec(ua);

    if (version !== null && version[1] < 5) {
      retval.browser = 'ie';
      retval.device = 'windows';
    }
  }

  switch (retval.device) {
    case 'iPhone':
      retval.type = 'mobile';
    case 'Mac':
      retval.type = 'pc';
    case 'Windows':
      retval.type = 'pc';
    default:
      retval.type = 'unknown';
  }


  return retval;
}
