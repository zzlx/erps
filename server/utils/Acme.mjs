/**
 * *****************************************************************************
 * 
 * ACME 客户端
 *
 * CA: Let’s Encrypt
 * 
 * @TODO: 未完成
 *
 * *****************************************************************************
 */

// 配置使用执行文件名作为进程名称
process.title = require('path').basename(__filename); 

const ACMEv2 = {
  production: "https://acme-v02.api.letsencrypt.org/directory", 
  staging: "https://acme-staging-v02.api.letsencrypt.org/directory",
}

import('../server/ACMEClient.mjs').then(m => {
	const acme = m.main && typeof m.main === 'function' ? m.main : m;
	// 执行
});
