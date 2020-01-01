/**
 *
 */

import console from '../utils/console.mjs';
import array from '../utils/array.mjs';
import string from '../utils/strings.mjs';
import path from 'path';
import fs from 'fs';

export default async function () {
	// 用到的数据表
  const t_jjdjj = 'OUTPUT.今借到.借据_1576602777990';
	const t_jdbjj = 'Output.借贷宝借据_1576452725938';
	const t_jkr_jjd = 'INFO.借款人_今借到_20191219';
	const t_xyr_md = 'INFO.嫌疑人_名单_20191218';
	const t_jkr_jdb = 'INFO.借款人_借贷宝_20191219';
	const t_jkr_zfb = 'INFO.借款人_支付宝账号_可信度高';
	const t_zfb_zhjl = 'OUTPUT.支付宝.账户记录_1576722573418';
	const t_xyr_zfbzcxx = 'INFO.嫌疑人_支付宝注册信息';
	const t_jjdjj_xdq = 't.今借到借据_新调取';
	const t_jdb_zcxx = '借贷宝.注册信息';
	const t_out = 'TEMP.暂存数据';


  const cursor = await this.db.find({}, {
    timeout: 60 * 60 * 1000,   // 60分钟
    maxTimeMS: 60 * 60 * 1000, // 60分钟
  });


}
