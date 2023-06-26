/**
 * *****************************************************************************
 *
 * 百度翻译API
 *
 *
 * [Documents](https://fanyi-api.baidu.com/doc/11)
 *
 * 请求方式： 可使用GET或POST方式，如使用POST方式，Content-Type请指定为：application/x-www-form-urlencoded
 * 字符编码：统一采用UTF-8编码格式
 * query长度：为保证翻译质量，请将单次请求长度控制在 6000 bytes以内。（汉字约为2000个）
 *
 * 签名生成方法：
 *
 * Step1. 将请求参数中的 APPID(appid)， 翻译query(q, 注意为UTF-8编码), 随机数(salt), 以及平台分配的密钥(可在管理控制台查看) 按照 appid+q+salt+密钥 的顺序拼接得到字符串1。
 * Step2. 对字符串1做md5，得到32位小写的sign。
 *
 * *****************************************************************************
 */

import { md5 } from '../../utils/md5.mjs';

const defaults = {
  q: '',
  from: 'auto', // en
  to: null, // zh
  appid: null,
  salt: null,
  sign: null,
}

export function translate (opts = {}) {
  const api = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
}
