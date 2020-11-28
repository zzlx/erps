/**
 * *****************************************************************************
 *
 * 管理API配置
 *
 *
 * *****************************************************************************
 */

import settings from '../settings.mjs';

const APIs = {
  district: {
    description: '高德开放平台API: 行政区域查询',
    requestMethod: 'GET',
    url: settings.amapDistrictApiUrl,
    parameters: {
      key: settings.amapDistrictApiKey, // 调用上限30万次/日
      keywords: '北京',
      // 0：不返回下级行政区；1：返回下一级；2：返回下两级；3：返回下三级；
      // 目前部分城市和省直辖县因为没有区县的概念，故在市级下方直接显示街道。
      filter: null,
      subdistrict: '2', 
      output: 'JSON', // 可选值：JSON，XML
    },
  },
};

export default new Proxy(APIs, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
});
