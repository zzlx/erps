/**
 * *****************************************************************************
 *
 * 身份证ID解析器
 *
 * 根据身份证号字段分析计算:
 * 年龄
 * 性别
 * 出生年月日
 * 省份编码
 * 城市编码
 * 地区编码的个人信息对象
 *
 * *****************************************************************************
 */

import { isEvenNumber } from './is/isEvenNumber.mjs';
const idNum = Symbol('idNumber');

export class IDNumber {
  constructor (idNumber) {
    this[idNum] = idNumber;
  }

  get sex () {
    return isEvenNumber(this[idNum].charAt(16)) ? '女' : '男'; 
  }

  get cityCode () {
    return this[idNum].substr(0, 4);
  }

  get regionCode () {
    return this[idNum].substr(0, 6);
  }

  get stateCode () {
    return this[idNum].substr(0, 3);
  }

  get birthday () {
    return this[idNum].substr(6, 8).replace(/(\d{4})(\d{2})(\d{2})/,"$1-$2-$3");
  }

  get age () {
    return ((Date.now() - Date.parse(this.birthday))/31536000000).toFixed();
  }
}
