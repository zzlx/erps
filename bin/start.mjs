#! /usr/bin/env node --no-warnings --experimental-json-modules

// 加载主控程序
import Main from '../src/main.mjs';
import PackageJson from './../package.json';

// 设置进程名称
process.title = PackageJson ? PackageJson.name : 'ERPS'; 

// 初始化系统环境 
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 捕获exception
process.on('uncaughtException', (err, origin) => {
  console.log(err);
});

// 捕获unhandled rejection
process.on('unhandledRejection', async (reason, promise) => {
  console.log('捕获到Rejection:', promise);
  if (reason.codeName === 'Unauthorized' && reason.code === 13) {
    //Params.user = await readFromInput('请输入数据库用户名:');
    //Params.pwd = await readFromInput('请输入密码:'); 
    //await saveConfig(); // 保存一下配置文件
    //await main();
  }
});

// test

// 执行主程序
new Main().run();
