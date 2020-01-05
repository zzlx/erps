/**
 *
 *
 *
 *
 */

import console from '../utils/console.mjs';
import array from '../utils/array.mjs';
import string from '../utils/strings.mjs';
import path from 'path';
import fs from 'fs';

export default async function () {
  // 执行临时任务
  // 防止误操作
  //return;
  
  let cn_jdb = 'Output.借贷宝借据_1576452725938';
  let cn_jjd = 't.今借到借据_新调取';
  let cn_jjhzb = 't.借据汇总表_1578201642017';
  let cn_xyrmd = 'INFO.嫌疑人_名单_20191218';
  let zfb_tdywf = 'OUTPUT.支付宝账户_推单业务费';

  const out = await this.db.collection(zfb_tdywf).find({}, {projection: {_id: 0}}).toArray();
  const csv = array(out).toCSV();
  const csvFile = path.join(process.cwd(), 'test.csv');

  return fs.promises.writeFile(csvFile, csv);
}
