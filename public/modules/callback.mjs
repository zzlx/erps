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

  //return; // bypass the rest tasks

  // Tasks:
  //
  // 1. 测试import动态加载模块功能
  import('./routes/index.mjs').then(m => m.default).then(routes => {
    console.log('task1:success');
    //console.log(routes);
  });

  // 2. 测试模块url地址
  console.log('当前模块url:', import.meta.url);

}
