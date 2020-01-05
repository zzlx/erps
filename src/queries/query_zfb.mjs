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
  
  let cn_zfb = 'INFO.嫌疑人_支付宝注册信息';
  let cn_zfb_zh = 'OUTPUT.支付宝.账户记录_1576722573418';
  let cn_xyr = 'INFO.嫌疑人_名单_20191218';
  let cn_jdb = 'Output.借贷宝借据_1576452725938';
  let cn_jjd = 't.今借到借据_新调取';


  const xyr = await this.db.collection(cn_xyr).find({}).toArray();
  const zfb_zcxx = await this.db.collection(cn_zfb).find({}).toArray();
  const zfb_id = array(zfb_zcxx).keyMap(zfb_zcxx, v => v['用户Id']);
  const xyr_id = array(xyr).keyMap(xyr, v => v['身份证号'])

  const zfb_cursor = this.db.collection(cn_zfb_zh).find({});
  const count = await zfb_cursor.count();
  let counter = 0;
  let d = null;
  let ops = [];

  while((d = await zfb_cursor.next()) !== null) {
    console.progressBar(counter++, count);
    const id = String(d['用户信息']).substr(0,16);
    const df_id = String(d['交易对方信息']).substr(0,16);
    if (zfb_id[id] && zfb_id[df_id]) {
      const xyrid_1 = zfb_id[id]['证件号'];
      const xyrid_2 = zfb_id[df_id]['证件号'];
      if (xyrid_1 == null || xyrid_2 == null) continue;

      const gs_1 = xyr_id[xyrid_1] ? xyr_id[xyrid_1]['公司'] : null;
      const gs_2 = xyr_id[xyrid_2] ? xyr_id[xyrid_2]['公司'] : null;

      if (gs_1 == null || gs_2 == null) continue;
      if (gs_1 == gs_2) continue;

      ops.push({
        insertOne: {
          document: {
            '交易号': d['交易号'], 
            '交易时间': d['付款时间'], 
            '账户': id,
            '账户姓名': xyr_id[xyrid_1]['姓名'],
            '账户所属公司': xyr_id[xyrid_1]['公司'],
            '对方账户': df_id,
            '对方账户姓名': xyr_id[xyrid_2]['姓名'],
            '对方账户公司': xyr_id[xyrid_2]['公司'],
            '收支': d['收/支'], 
            '金额': d['金额（元）'], 
            '交易状态': d['交易状态'], 
            '消费名称': d['消费名称'], 
            '备注': d['备注'], 
          }
        }
      })
    }

  }


  let newZFB = 'OUTPUT.支付宝账户_推单业务费';
  await this.db.collection(newZFB).bulkWrite(ops);

}
