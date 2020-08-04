/**
 * *****************************************************************************
 *
 * 用于前端渲染完成后执行任务
 *
 * *****************************************************************************
 */

import store from './store/index.mjs';
import path from './utils/path.mjs';

export default function () {
  console.info(
    `UI程序已就绪,使用过程中如遇到问题,请通知系统管理员. 
Email: wangxuemin@zzlx.org.`
  );

  if (env && env === 'development') console.warn(`当前环境为: ${env}.`); 

}
