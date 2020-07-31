/**
 * *****************************************************************************
 *
 * 用于前端渲染完成后执行任务
 *
 * *****************************************************************************
 */

export default function () {

  console.info(
  `前端程序已准备就绪...
操作使用过程中如遇到问题,请通知管理员进行处理. 
Email: wangxuemin@zzlx.org.`);

  // Tasks:
  //
  // 1. 测试import动态加载模块功能
  import('./views/routes.mjs').then(m => m.default).then(routes => {
    console.log('task1:success');
    //console.log(routes);
  });

  // 2. 

}
